import { useState, useEffect } from "react";
import { Star, CheckSquare, Square, CheckCircle } from "lucide-react";
import Layout from "../../components/Layout";
import { supabase } from "../../lib/supabase";

const matricula = "20241234";
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const CRITERIOS = [
  { key: "sabor",       label: "Sabor da Comida" },
  { key: "temperatura", label: "Temperatura dos Pratos" },
  { key: "saciedade",   label: "Saciedade" },
  { key: "satisfacao",  label: "Satisfação Geral" },
];

const PRATO_LABELS = {
  prato_principal: "Prato Principal",
  vegetariano:     "Opção Vegetariana",
  acompanhamentos: "Acompanhamentos",
  salada:          "Salada",
  sobremesa:       "Sobremesa",
};

function toMin(time) {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function turnoLabel(t) {
  return t === "almoco" ? "Almoço" : "Jantar";
}

function Bloqueio({ emoji, titulo, descricao }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm text-center space-y-2">
      <p className="text-2xl">{emoji}</p>
      <p className="text-sm font-semibold text-gray-500">{titulo}</p>
      <p className="text-xs text-gray-400">{descricao}</p>
    </div>
  );
}

export default function Avaliacao() {
  const diaAtual = DIAS_SEMANA[new Date().getDay()];
  const dataHoje = new Date().toISOString().split("T")[0];
  const agoraMin = new Date().getHours() * 60 + new Date().getMinutes();

  const [loading,            setLoading]            = useState(true);
  const [turnoAtual,         setTurnoAtual]         = useState(null);
  const [cardapio,           setCardapio]           = useState(null);
  const [intencaoConfirmada, setIntencaoConfirmada] = useState(null);
  const [avaliados,          setAvaliados]          = useState([]);
  const [pratosSelecionados, setPratosSelecionados] = useState([]);
  const [notas,              setNotas]              = useState({ sabor: 0, temperatura: 0, saciedade: 0, satisfacao: 0 });
  const [enviando,           setEnviando]           = useState(false);
  const [erro,               setErro]               = useState(null);
  const [sucesso,            setSucesso]            = useState(false);

  useEffect(() => { iniciar(); }, []);

  async function iniciar() {
    const { data: cfg } = await supabase.from("configuracoes").select("*").limit(1).single();
    if (!cfg) { setLoading(false); return; }

    let turno = null;
    if (agoraMin >= toMin(cfg.almoco_abertura) && agoraMin <= toMin(cfg.almoco_fechamento)) turno = "almoco";
    if (agoraMin >= toMin(cfg.jantar_abertura) && agoraMin <= toMin(cfg.jantar_fechamento)) turno = "jantar";
    setTurnoAtual(turno);

    if (!turno) { setLoading(false); return; }

    const [cardapioRes, intencaoRes, avaliacoesRes] = await Promise.all([
      supabase.from("cardapios").select("*").eq("dia", diaAtual).eq("turno", turno).eq("status", "publicado").limit(1).single(),
      localStorage.getItem(`presenca_${turno}`) === "true"
        ? Promise.resolve({ data: true })
        : supabase.from("meal_intentions").select("id").eq("matricula", matricula).eq("refeicao", turno).eq("data", dataHoje).eq("confirmado", true).limit(1).single(),
      supabase.from("avaliacoes").select("prato").eq("matricula", matricula).eq("turno", turno).eq("data", dataHoje),
    ]);

    setCardapio(cardapioRes.data || null);
    setIntencaoConfirmada(!!(intencaoRes.data === true || (!intencaoRes.error && !!intencaoRes.data)));
    if (avaliacoesRes.data) setAvaliados(avaliacoesRes.data.map((i) => i.prato));

    setLoading(false);
  }

  async function handleEnviar() {
    if (!podeEnviar || !cardapio) return;
    setEnviando(true);
    setErro(null);
    try {
      const { error } = await supabase.from("avaliacoes").insert(
        pratosSelecionados.map((prato) => ({
          cardapio_id:      cardapio.id,
          matricula,
          turno:            turnoAtual,
          dia:              diaAtual,
          data:             dataHoje,       // <-- agora salva a data real também
          prato,
          nota_sabor:       notas.sabor,
          nota_temperatura: notas.temperatura,
          nota_saciedade:   notas.saciedade,
          nota_satisfacao:  notas.satisfacao,
        }))
      );
      if (error) throw error;
      setAvaliados((prev) => [...prev, ...pratosSelecionados]);
      setPratosSelecionados([]);
      setNotas({ sabor: 0, temperatura: 0, saciedade: 0, satisfacao: 0 });
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch {
      setErro("Erro ao enviar avaliação.");
    } finally {
      setEnviando(false);
    }
  }

  const pratosDisponiveis = cardapio ? Object.keys(PRATO_LABELS).filter((k) => cardapio[k]) : [];
  const podeEnviar = pratosSelecionados.length > 0 && CRITERIOS.every(({ key }) => notas[key] > 0);

  if (loading) return (
    <Layout titulo="Avaliação da Refeição" ativo="avaliar">
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Carregando...</div>
    </Layout>
  );

  return (
    <Layout titulo="Avaliação da Refeição" ativo="avaliar">
      <div className="space-y-4">

        {!turnoAtual && <Bloqueio emoji="🕐" titulo="Fora do horário de avaliação" descricao="Avaliações ficam disponíveis durante o funcionamento do RU." />}
        {turnoAtual && !intencaoConfirmada && <Bloqueio emoji="🍽️" titulo="Sem intenção confirmada" descricao={`Confirme presença no ${turnoLabel(turnoAtual)} antes de avaliar.`} />}
        {turnoAtual && intencaoConfirmada && !cardapio && <Bloqueio emoji="📋" titulo="Cardápio não publicado" descricao="O gestor ainda não publicou o cardápio de hoje." />}

        {turnoAtual && intencaoConfirmada && cardapio && (
          <>
            {sucesso && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-white text-sm font-semibold shadow-sm" style={{ backgroundColor: "#166534" }}>
                <CheckCircle size={16} /> Avaliação enviada com sucesso!
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>O que achou do {turnoLabel(turnoAtual)}?</h1>
              <p className="text-sm text-gray-500 mt-1">Seu feedback ajuda a equipe do RU a melhorar o cardápio.</p>
            </div>

            <div className="bg-white rounded-2xl px-4 py-4 shadow-sm space-y-3">
              <p className="text-sm font-semibold text-gray-900">Escolha os pratos para avaliar</p>
              <div className="space-y-2">
                {pratosDisponiveis.map((prato) => {
                  const selecionado = pratosSelecionados.includes(prato);
                  const jaAvaliado  = avaliados.includes(prato);
                  return (
                    <button key={prato} disabled={jaAvaliado}
                      onClick={() => setPratosSelecionados((prev) => prev.includes(prato) ? prev.filter((p) => p !== prato) : [...prev, prato])}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border transition-all disabled:opacity-70"
                      style={{ borderColor: selecionado ? "#166534" : "#e5e7eb", backgroundColor: jaAvaliado ? "#f3f4f6" : selecionado ? "#f0fdf4" : "#fafafa" }}
                    >
                      {selecionado
                        ? <CheckSquare size={20} style={{ color: "#166534" }} />
                        : <Square size={20} className={jaAvaliado ? "text-green-600" : "text-gray-300"} />}
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-800">{PRATO_LABELS[prato]}</p>
                        <p className="text-xs text-gray-400">{cardapio[prato]}</p>
                      </div>
                      {jaAvaliado && <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">Avaliado</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {CRITERIOS.map(({ key, label }) => (
                <div key={key} className="bg-white rounded-2xl px-4 py-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-900">{label}</p>
                    <p className="text-sm font-bold text-orange-500">{notas[key] > 0 ? `${notas[key]} / 5` : "- / 5"}</p>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button key={i} onClick={() => setNotas((prev) => ({ ...prev, [key]: i }))}>
                        <Star size={28} className={i <= notas[key] ? "text-orange-500" : "text-gray-200"} fill={i <= notas[key] ? "#f97316" : "#e5e7eb"} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {erro && <p className="text-center text-sm text-red-500">{erro}</p>}

            <button onClick={handleEnviar} disabled={!podeEnviar || enviando}
              className="w-full py-4 rounded-2xl text-white font-bold text-base transition-opacity"
              style={{ backgroundColor: "#166534", opacity: podeEnviar && !enviando ? 1 : 0.4 }}
            >
              {enviando ? "Enviando..." : "Enviar Avaliação"}
            </button>

            <p className="text-center text-xs text-gray-400">Cada prato pode ser avaliado apenas uma vez por turno.</p>
          </>
        )}
      </div>
    </Layout>
  );
}