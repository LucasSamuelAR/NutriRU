import { useState, useEffect, useRef } from "react";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import Layout from "../../components/Layout";
import { supabase } from "../../lib/supabase";

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const categoriaConfig = {
  "PRATO PRINCIPAL":    { bg: "bg-orange-50", text: "text-orange-500" },
  "OPÇÃO VEGETARIANA":  { bg: "bg-green-50",  text: "text-green-600" },
  "ACOMPANHAMENTOS":    { bg: "bg-green-50",  text: "text-green-700" },
  "SOBREMESA & SALADA": { bg: "bg-green-50",  text: "text-green-600" },
};

const matricula = "20241234";

function horaParaDecimal(str) {
  if (!str) return null;
  const [h, m] = str.split(":").map(Number);
  return h + m / 60;
}

function horaFormatada(str) {
  if (!str) return "";
  return str.slice(0, 5);
}

function calcularEstado(horaAtual, config) {
  const intAlmocoInicio = horaParaDecimal(config?.intencao_almoco_inicio) ?? 6;
  const intAlmocoLimite = horaParaDecimal(config?.intencao_almoco_limite) ?? 10.5;
  const almocoFecha     = horaParaDecimal(config?.almoco_fechamento)       ?? 14;
  const intJantarInicio = horaParaDecimal(config?.intencao_jantar_inicio)  ?? 14;
  const intJantarLimite = horaParaDecimal(config?.intencao_jantar_limite)  ?? 18.5;
  const jantarFecha     = horaParaDecimal(config?.jantar_fechamento)       ?? 20;

  if (horaAtual < intAlmocoInicio || horaAtual >= jantarFecha) return "antes_almoco";
  if (horaAtual >= intAlmocoInicio && horaAtual < intAlmocoLimite) return "janela_almoco";
  if (horaAtual >= intAlmocoLimite && horaAtual < almocoFecha) return "encerrado_almoco";
  if (horaAtual >= almocoFecha && horaAtual < intJantarInicio) return "antes_jantar";
  if (horaAtual >= intJantarInicio && horaAtual < intJantarLimite) return "janela_jantar";
  if (horaAtual >= intJantarLimite && horaAtual < jantarFecha) return "encerrado_jantar";
  return "antes_almoco";
}

export default function Inicio() {
  const hoje = new Date();
  const diaSemana = diasSemana[hoje.getDay()];
  const dataFormatada = hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const dataHoje = hoje.toISOString().split("T")[0];
  const horaAtual = hoje.getHours() + hoje.getMinutes() / 60;

  const [turno, setTurno] = useState(() => localStorage.getItem("turno_selecionado") || "almoco");

  const [cardapio, setCardapio] = useState(() => {
    const cached = localStorage.getItem("ru_cardapio");
    if (!cached) return { almoco: [], jantar: [] };
    const parsed = JSON.parse(cached);
    if (parsed.dia !== dataHoje) return { almoco: [], jantar: [] };
    return parsed;
  });

  const [almoco, setAlmoco] = useState(() => localStorage.getItem("presenca_almoco") === "true");
  const [jantar, setJantar] = useState(() => localStorage.getItem("presenca_jantar") === "true");
  const [config, setConfig] = useState(() => {
    const cached = localStorage.getItem("ru_config");
    return cached ? JSON.parse(cached) : null;
  });
  const buscouRef = useRef(false);

  const almocoAbertura   = horaParaDecimal(config?.almoco_abertura)  ?? 11.5;
  const almocoFechamento = horaParaDecimal(config?.almoco_fechamento) ?? 14;
  const jantarAbertura   = horaParaDecimal(config?.jantar_abertura)   ?? 17.5;
  const jantarFechamento = horaParaDecimal(config?.jantar_fechamento) ?? 20;

  const ruAberto = (horaAtual >= almocoAbertura && horaAtual < almocoFechamento) ||
                   (horaAtual >= jantarAbertura && horaAtual < jantarFechamento);

  const estado = calcularEstado(horaAtual, config);

  const presencaAlmocoRelevante = estado === "janela_almoco" || estado === "encerrado_almoco";
  const presencaJantarRelevante = estado === "janela_jantar" || estado === "encerrado_jantar";
  const presencaConfirmada = (presencaAlmocoRelevante && almoco) || (presencaJantarRelevante && jantar);
  const turnoAtivo = presencaAlmocoRelevante ? "almoco" : "jantar";

  useEffect(() => {
    if (!buscouRef.current) {
      buscouRef.current = true;

      supabase.from("configuracoes").select("*").limit(1).single().then(({ data }) => {
        if (data) { setConfig(data); localStorage.setItem("ru_config", JSON.stringify(data)); }
      });

      supabase
        .from("cardapios")
        .select("*")
        .eq("dia", diaSemana)
        .eq("status", "publicado")
        .then(({ data, error }) => {
          if (error || !data) return;
          const almocoItens = [], jantarItens = [];
          data.forEach((item) => {
            const itens = [
              { categoria: "PRATO PRINCIPAL",    nome: item.prato_principal, kcal: item.kcal_principal },
              { categoria: "OPÇÃO VEGETARIANA",  nome: item.vegetariano,     kcal: item.kcal_vegetal },
              { categoria: "ACOMPANHAMENTOS",    nome: item.acompanhamentos, kcal: item.kcal_acomp },
              { categoria: "SOBREMESA & SALADA", nome: `${item.salada} e ${item.sobremesa}`, kcal: item.kcal_salada && item.kcal_sobremesa ? item.kcal_salada + item.kcal_sobremesa : null },
            ];
            if (item.turno === "almoco") almocoItens.push(...itens);
            if (item.turno === "jantar") jantarItens.push(...itens);
          });
          setCardapio({ almoco: almocoItens, jantar: jantarItens });
          localStorage.setItem("ru_cardapio", JSON.stringify({ almoco: almocoItens, jantar: jantarItens, dia: dataHoje }));
        });
    }

    function buscarPresenca() {
      supabase
        .from("meal_intentions")
        .select("refeicao")
        .eq("matricula", matricula)
        .eq("data", dataHoje)
        .then(({ data, error }) => {
          if (error || !data) return;
          const almocoConfirmado = !!data.find((d) => d.refeicao === "almoco");
          const jantarConfirmado = !!data.find((d) => d.refeicao === "jantar");
          setAlmoco(almocoConfirmado);
          setJantar(jantarConfirmado);
          localStorage.setItem("presenca_almoco", almocoConfirmado);
          localStorage.setItem("presenca_jantar", jantarConfirmado);
        });
    }

    buscarPresenca();

    function handleVisibilidade() {
      if (document.visibilityState === "visible") buscarPresenca();
    }

    document.addEventListener("visibilitychange", handleVisibilidade);
    return () => document.removeEventListener("visibilitychange", handleVisibilidade);
  }, []);

  function renderBanner() {
    if (presencaConfirmada) {
      return (
        <div className="bg-green-700 rounded-2xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={22} className="text-white flex-shrink-0" />
            <div>
              <p className="text-green-200 text-xs">Sua presença de hoje</p>
              <p className="text-white font-bold text-sm">
                {turnoAtivo === "almoco" ? "Almoço" : "Jantar"} confirmado para hoje!
              </p>
            </div>
          </div>
          <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {turnoAtivo === "almoco"
              ? `${horaFormatada(config?.almoco_abertura) || "11:30"} - ${horaFormatada(config?.almoco_fechamento) || "14:00"}`
              : `${horaFormatada(config?.jantar_abertura) || "17:30"} - ${horaFormatada(config?.jantar_fechamento) || "20:00"}`}
          </span>
        </div>
      );
    }

    if (estado === "antes_almoco") {
      return (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={22} className="text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-orange-400 text-xs">Próxima janela de confirmação</p>
              <p className="text-orange-700 font-bold text-sm">
                Confirmações do almoço abrem às {horaFormatada(config?.intencao_almoco_inicio) || "07:00"}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (estado === "janela_almoco") {
      return (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={22} className="text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-orange-400 text-xs">Sua presença de hoje</p>
              <p className="text-orange-700 font-bold text-sm">Confirme seu almoço de hoje!</p>
            </div>
          </div>
          <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            até {horaFormatada(config?.intencao_almoco_limite) || "10:30"}
          </span>
        </div>
      );
    }

    if (estado === "encerrado_almoco") {
      return (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={22} className="text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-orange-400 text-xs">Sua presença de hoje</p>
              <p className="text-orange-700 font-bold text-sm">Confirmações encerradas para o almoço</p>
            </div>
          </div>
        </div>
      );
    }

    if (estado === "antes_jantar") {
      return (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={22} className="text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-orange-400 text-xs">Próxima janela de confirmação</p>
              <p className="text-orange-700 font-bold text-sm">
                Confirmações do jantar abrem às {horaFormatada(config?.intencao_jantar_inicio) || "14:00"}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (estado === "janela_jantar") {
      return (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={22} className="text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-orange-400 text-xs">Sua presença de hoje</p>
              <p className="text-orange-700 font-bold text-sm">Confirme seu jantar de hoje!</p>
            </div>
          </div>
          <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            até {horaFormatada(config?.intencao_jantar_limite) || "18:30"}
          </span>
        </div>
      );
    }

    if (estado === "encerrado_jantar") {
      return (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={22} className="text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-orange-400 text-xs">Sua presença de hoje</p>
              <p className="text-orange-700 font-bold text-sm">Confirmações encerradas para o jantar</p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  const itens = cardapio[turno];
  const totalKcal = itens.reduce((acc, item) => acc + (item.kcal || 0), 0);

  return (
    <Layout titulo="NutriRU" ativo="inicio">
      <div className="space-y-4">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>Olá, Mariana!</h1>
            <p className="text-sm text-gray-500 capitalize">{dataFormatada}</p>
          </div>
          <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${ruAberto ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
            <span className={`w-2 h-2 rounded-full ${ruAberto ? "bg-green-500" : "bg-gray-400"}`}></span>
            {ruAberto ? "RU Aberto" : "RU Fechado"}
          </span>
        </div>

        {renderBanner()}

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Cardápio do dia</p>
            <div className="flex gap-1 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => { setTurno("almoco"); localStorage.setItem("turno_selecionado", "almoco"); }}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${turno === "almoco" ? "bg-green-700 text-white" : "text-gray-500"}`}
              >
                Almoço
              </button>
              <button
                onClick={() => { setTurno("jantar"); localStorage.setItem("turno_selecionado", "jantar"); }}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${turno === "jantar" ? "bg-green-700 text-white" : "text-gray-500"}`}
              >
                Jantar
              </button>
            </div>
          </div>

          {itens.length > 0 ? (
            <>
              <div className="space-y-2">
                {itens.map((item, i) => {
                  const cfg = categoriaConfig[item.categoria];
                  return (
                    <div key={i} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
                      <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-xs font-bold ${cfg.text}`}>{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold tracking-wide uppercase ${cfg.text}`}>{item.categoria}</p>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{item.nome}</p>
                      </div>
                      {item.kcal && (
                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0">
                          {item.kcal} kcal
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {totalKcal > 0 && (
                <div className="mt-2 bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-green-700">Total da refeição</p>
                  <span className="bg-green-700 text-white text-sm font-bold px-3 py-1 rounded-xl">{totalKcal} kcal</span>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl p-8 flex items-center justify-center shadow-sm">
              <p className="text-sm text-gray-400 font-semibold">Nenhum cardápio publicado para hoje</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}