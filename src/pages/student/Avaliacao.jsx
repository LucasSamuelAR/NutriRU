import { useState, useEffect } from "react";
import { Star, CheckSquare, Square } from "lucide-react";
import Layout from "../../components/Layout";
import { supabase } from "../../lib/supabase";

const criterios = [
  { key: "sabor", label: "Sabor da Comida" },
  { key: "temperatura", label: "Temperatura dos Pratos" },
  { key: "saciedade", label: "Saciedade" },
  { key: "satisfacao", label: "Satisfação Geral" },
];

const PRATO_LABELS = {
  prato_principal: "Prato Principal",
  vegetariano: "Opção Vegetariana",
  acompanhamentos: "Acompanhamentos",
  salada: "Salada",
  sobremesa: "Sobremesa",
};

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getDiaSemanaAtual() {
  return DIAS_SEMANA[new Date().getDay()];
}

// Retorna "almoco" ou "jantar" — igual ao que a intenção salva
function getTurnoAtual() {
  const h = new Date().getHours();
  if (h >= 11 && h < 15) return "almoco";
  if (h >= 17 && h < 21) return "jantar";
  return null;
}

function getTurnoLabel(turno) {
  return turno === "almoco" ? "Almoço" : "Jantar";
}

const matricula = "20241234"; // igual à página de intenção

export default function Avaliacao() {
  const [cardapio, setCardapio] = useState(null);
  const [intencaoConfirmada, setIntencaoConfirmada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pratosSelecionados, setPratosSelecionados] = useState([]);
  const [notas, setNotas] = useState({ sabor: 0, temperatura: 0, saciedade: 0, satisfacao: 0 });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState(null);

  const turnoAtual = getTurnoAtual();
  const diaAtual = getDiaSemanaAtual();
  const dataHoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!turnoAtual) { setLoading(false); return; }
    Promise.all([fetchCardapio(), fetchIntencao()]).finally(() => setLoading(false));
  }, []);

  async function fetchCardapio() {
    const { data } = await supabase
      .from("cardapios")
      .select("*")
      .eq("dia", diaAtual)
      .eq("turno", turnoAtual) // "almoco" ou "jantar"
      .eq("status", "publicado")
      .limit(1)
      .single();

    setCardapio(data || null);
  }

  async function fetchIntencao() {
    // Tenta primeiro pelo localStorage (já confirmado na outra tela)
    const cachedKey = `presenca_${turnoAtual}`;
    const cached = localStorage.getItem(cachedKey);

    if (cached === "true") {
      setIntencaoConfirmada(true);
      return;
    }

    // Fallback: consulta o banco diretamente
    const { data, error } = await supabase
      .from("meal_intentions")
      .select("id")
      .eq("matricula", matricula)
      .eq("refeicao", turnoAtual) // "almoco" ou "jantar" — igual ao que intenção salva
      .eq("data", dataHoje)
      .eq("confirmado", true)
      .limit(1)
      .single();

    setIntencaoConfirmada(!error && !!data);
  }

  function togglePrato(prato) {
    setPratosSelecionados((prev) =>
      prev.includes(prato) ? prev.filter((p) => p !== prato) : [...prev, prato]
    );
  }

  function setNota(key, valor) {
    setNotas((prev) => ({ ...prev, [key]: valor }));
  }

  const pratosDisponiveis = cardapio
    ? Object.keys(PRATO_LABELS).filter((k) => cardapio[k])
    : [];

  const todasNotasPreenchidas = criterios.every(({ key }) => notas[key] > 0);
  const podeEnviar = pratosSelecionados.length > 0 && todasNotasPreenchidas;

  async function handleEnviar() {
    if (!podeEnviar || !cardapio) return;
    setEnviando(true);
    setErro(null);
    try {
      const { error } = await supabase.from("avaliacoes").insert({
        cardapio_id: cardapio.id,
        turno: turnoAtual,
        dia: diaAtual,
        pratos_consumidos: pratosSelecionados,
        nota_sabor: notas.sabor,
        nota_temperatura: notas.temperatura,
        nota_saciedade: notas.saciedade,
        nota_satisfacao: notas.satisfacao,
      });
      if (error) throw error;
      setEnviado(true);
    } catch (e) {
      setErro("Erro ao enviar avaliação. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  // ─── Estados de tela ───────────────────────

  if (loading) {
    return (
      <Layout titulo="Avaliação da Refeição" ativo="avaliar">
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Carregando...</div>
      </Layout>
    );
  }

  if (!turnoAtual) {
    return (
      <Layout titulo="Avaliação da Refeição" ativo="avaliar">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center space-y-2">
          <p className="text-2xl">🕐</p>
          <p className="text-sm font-semibold text-gray-500">Fora do horário de avaliação</p>
          <p className="text-xs text-gray-400">Avaliações ficam disponíveis durante os turnos de funcionamento do RU.</p>
        </div>
      </Layout>
    );
  }

  if (!intencaoConfirmada) {
    return (
      <Layout titulo="Avaliação da Refeição" ativo="avaliar">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center space-y-2">
          <p className="text-2xl">🍽️</p>
          <p className="text-sm font-semibold text-gray-500">Sem intenção confirmada</p>
          <p className="text-xs text-gray-400">
            Confirme sua presença no {getTurnoLabel(turnoAtual)} antes de avaliar.
          </p>
        </div>
      </Layout>
    );
  }

  if (!cardapio) {
    return (
      <Layout titulo="Avaliação da Refeição" ativo="avaliar">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center space-y-2">
          <p className="text-2xl">📋</p>
          <p className="text-sm font-semibold text-gray-500">Cardápio não publicado</p>
          <p className="text-xs text-gray-400">O cardápio de hoje ainda não foi publicado pelo gestor.</p>
        </div>
      </Layout>
    );
  }

  if (enviado) {
    return (
      <Layout titulo="Avaliação da Refeição" ativo="avaliar">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center space-y-3">
          <p className="text-4xl">✅</p>
          <p className="text-lg font-bold" style={{ color: "#166534" }}>Avaliação enviada!</p>
          <p className="text-sm text-gray-500">Obrigado pelo seu feedback. Ele ajuda a melhorar o cardápio do RU.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout titulo="Avaliação da Refeição" ativo="avaliar">
      <div className="space-y-4">

        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>
            O que achou do {getTurnoLabel(turnoAtual)}?
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Seu feedback é anônimo e ajuda a equipe de nutrição a melhorar o cardápio diariamente.
          </p>
        </div>

        {/* Seleção de pratos */}
        <div className="bg-white rounded-2xl px-4 py-4 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-gray-900">O que você comeu hoje?</p>
          <div className="space-y-2">
            {pratosDisponiveis.map((prato) => {
              const selecionado = pratosSelecionados.includes(prato);
              return (
                <button
                  key={prato}
                  onClick={() => togglePrato(prato)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border transition-all"
                  style={{
                    borderColor: selecionado ? "#166534" : "#e5e7eb",
                    backgroundColor: selecionado ? "#f0fdf4" : "#fafafa",
                  }}
                >
                  {selecionado
                    ? <CheckSquare size={20} style={{ color: "#166534" }} />
                    : <Square size={20} className="text-gray-300" />}
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800">{PRATO_LABELS[prato]}</p>
                    <p className="text-xs text-gray-400">{cardapio[prato]}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Critérios */}
        <div className="space-y-3">
          {criterios.map(({ key, label }) => (
            <div key={key} className="bg-white rounded-2xl px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                <p className="text-sm font-bold text-orange-500">
                  {notas[key] > 0 ? `${notas[key]} / 5` : "- / 5"}
                </p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} onClick={() => setNota(key, i)}>
                    <Star
                      size={28}
                      className={i <= notas[key] ? "text-orange-500" : "text-gray-200"}
                      fill={i <= notas[key] ? "#f97316" : "#e5e7eb"}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {erro && <p className="text-center text-sm text-red-500">{erro}</p>}

        <button
          onClick={handleEnviar}
          disabled={!podeEnviar || enviando}
          className="w-full py-4 rounded-2xl text-white font-bold text-base transition-opacity"
          style={{
            backgroundColor: "#166534",
            opacity: podeEnviar && !enviando ? 1 : 0.4,
          }}
        >
          {enviando ? "Enviando..." : "Enviar Avaliação"}
        </button>

        <p className="text-center text-xs text-gray-400">
          Você pode avaliar durante o horário de funcionamento do turno.
        </p>

      </div>
    </Layout>
  );
}