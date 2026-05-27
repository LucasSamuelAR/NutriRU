import { useState, useEffect, useRef } from "react";
import { Sun, Moon, Sparkles, Clock, Lock } from "lucide-react";
import Layout from "../../components/Layout";
import { supabase } from "../../lib/supabase";

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

export default function Intencao() {
  const [almoco, setAlmoco] = useState(() => localStorage.getItem("presenca_almoco") === "true");
  const [jantar, setJantar] = useState(() => localStorage.getItem("presenca_jantar") === "true");
  const [config, setConfig] = useState(() => {
    const cached = localStorage.getItem("ru_config");
    return cached ? JSON.parse(cached) : null;
  });
  const buscouRef = useRef(false);

  const dataHoje = new Date().toISOString().split("T")[0];
  const horaAtual = new Date().getHours() + new Date().getMinutes() / 60;

  const intencaoAlmocoInicio = horaParaDecimal(config?.intencao_almoco_inicio) ?? 6;
  const intencaoAlmocoLimite = horaParaDecimal(config?.intencao_almoco_limite) ?? 10.5;
  const intencaoJantarInicio = horaParaDecimal(config?.intencao_jantar_inicio) ?? 14;
  const intencaoJantarLimite = horaParaDecimal(config?.intencao_jantar_limite) ?? 18.5;

  const almocoAberto = horaAtual >= intencaoAlmocoInicio && horaAtual < intencaoAlmocoLimite;
  const jantarAberto = horaAtual >= intencaoJantarInicio && horaAtual < intencaoJantarLimite;
  const almocoEncerrado = !almocoAberto;
  const jantarEncerrado = !jantarAberto;

  useEffect(() => {
    if (buscouRef.current) return;
    buscouRef.current = true;

    supabase.from("configuracoes").select("*").limit(1).single().then(({ data }) => {
      if (data) {
        setConfig(data);
        localStorage.setItem("ru_config", JSON.stringify(data));
      }
    });

    supabase.from("meal_intentions").select("refeicao").eq("matricula", matricula).eq("data", dataHoje).then(({ data, error }) => {
      if (error) return;
      const almocoConfirmado = !!data?.find(d => d.refeicao === "almoco");
      const jantarConfirmado = !!data?.find(d => d.refeicao === "jantar");
      setAlmoco(almocoConfirmado);
      setJantar(jantarConfirmado);
      localStorage.setItem("presenca_almoco", almocoConfirmado);
      localStorage.setItem("presenca_jantar", jantarConfirmado);
    });
  }, []);

  const toggleAlmoco = async () => {
    if (almocoEncerrado) return;
    if (almoco) {
      await supabase.from("meal_intentions").delete().eq("matricula", matricula).eq("refeicao", "almoco").eq("data", dataHoje);
      setAlmoco(false);
      localStorage.setItem("presenca_almoco", false);
    } else {
      await supabase.from("meal_intentions").upsert({ matricula, refeicao: "almoco", data: dataHoje, confirmado: true });
      setAlmoco(true);
      localStorage.setItem("presenca_almoco", true);
    }
  };

  const toggleJantar = async () => {
    if (jantarEncerrado) return;
    if (jantar) {
      await supabase.from("meal_intentions").delete().eq("matricula", matricula).eq("refeicao", "jantar").eq("data", dataHoje);
      setJantar(false);
      localStorage.setItem("presenca_jantar", false);
    } else {
      await supabase.from("meal_intentions").upsert({ matricula, refeicao: "jantar", data: dataHoje, confirmado: true });
      setJantar(true);
      localStorage.setItem("presenca_jantar", true);
    }
  };

  return (
    <Layout titulo="Intenção de Refeição" ativo="intencao">
      <div className="space-y-4">

        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>Vai comer no RU hoje?</h1>
          <p className="text-sm text-gray-500 mt-1">
            Confirme sua presença com antecedência para ajudar a gestão a calcular a quantidade de comida e evitar o desperdício.
          </p>
        </div>

        {/* CARD ALMOÇO */}
        <div className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${almoco ? "border-green-700" : "border-gray-100"} ${almocoEncerrado ? "opacity-75" : ""}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${almoco && !almocoEncerrado ? "bg-green-700" : "bg-gray-100"}`}>
                <Sun size={20} className={almoco && !almocoEncerrado ? "text-white" : "text-gray-400"} />
              </div>
              <div>
                <p className="font-bold text-gray-900">Almoço</p>
                <p className="text-xs text-gray-500">Hoje, das {horaFormatada(config?.almoco_abertura) || "11:30"} às {horaFormatada(config?.almoco_fechamento) || "14:00"}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock size={11} className={almocoEncerrado ? "text-red-400" : "text-orange-400"} />
                  <p className={`text-xs font-medium ${almocoEncerrado ? "text-red-400" : "text-orange-400"}`}>
                    {almocoEncerrado ? "Confirmações encerradas" : `Confirmar até às ${horaFormatada(config?.intencao_almoco_limite) || "10:30"}`}
                  </p>
                </div>
              </div>
            </div>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${almoco && !almocoEncerrado ? "bg-green-700" : "border-2 border-gray-200"}`}>
              {almoco && !almocoEncerrado && <span className="text-white text-xs font-bold">✓</span>}
              {almocoEncerrado && <Lock size={12} className="text-gray-400" />}
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">Status:{" "}
              <span className={almoco ? "text-green-700 font-medium" : "text-gray-400"}>
                {almocoEncerrado ? "Encerrado" : almoco ? "Confirmado" : "Não confirmado"}
              </span>
            </p>
            {almocoEncerrado ? (
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl">Prazo encerrado</span>
            ) : (
              <button onClick={toggleAlmoco} className={`text-sm font-semibold px-4 py-1.5 rounded-xl transition-all ${almoco ? "text-orange-500" : "bg-green-50 text-green-700"}`}>
                {almoco ? "Cancelar Confirmação" : "Confirmar Almoço"}
              </button>
            )}
          </div>
        </div>

        {/* CARD JANTAR */}
        <div className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${jantar ? "border-green-700" : "border-gray-100"} ${jantarEncerrado ? "opacity-75" : ""}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${jantar && !jantarEncerrado ? "bg-green-700" : "bg-gray-100"}`}>
                <Moon size={20} className={jantar && !jantarEncerrado ? "text-white" : "text-gray-400"} />
              </div>
              <div>
                <p className="font-bold text-gray-900">Jantar</p>
                <p className="text-xs text-gray-500">Hoje, das {horaFormatada(config?.jantar_abertura) || "17:30"} às {horaFormatada(config?.jantar_fechamento) || "20:00"}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock size={11} className={jantarEncerrado ? "text-red-400" : "text-orange-400"} />
                  <p className={`text-xs font-medium ${jantarEncerrado ? "text-red-400" : "text-orange-400"}`}>
                    {jantarEncerrado ? "Confirmações encerradas" : `Confirmar até às ${horaFormatada(config?.intencao_jantar_limite) || "18:30"}`}
                  </p>
                </div>
              </div>
            </div>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${jantar && !jantarEncerrado ? "bg-green-700" : "border-2 border-gray-200"}`}>
              {jantar && !jantarEncerrado && <span className="text-white text-xs font-bold">✓</span>}
              {jantarEncerrado && <Lock size={12} className="text-gray-400" />}
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">Status:{" "}
              <span className={jantar ? "text-green-700 font-medium" : "text-gray-400"}>
                {jantarEncerrado ? "Encerrado" : jantar ? "Confirmado" : "Não confirmado"}
              </span>
            </p>
            {jantarEncerrado ? (
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl">Prazo encerrado</span>
            ) : (
              <button onClick={toggleJantar} className={`text-sm font-semibold px-4 py-1.5 rounded-xl transition-all ${jantar ? "text-orange-500" : "bg-green-50 text-green-700"}`}>
                {jantar ? "Cancelar Confirmação" : "Confirmar Jantar"}
              </button>
            )}
          </div>
        </div>

        <div className="bg-gray-100 rounded-2xl p-4 flex items-start gap-3">
          <Sparkles size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-gray-900">Seu impacto esta semana</p>
            <p className="text-sm text-gray-500 mt-0.5">Ao confirmar, você ajudou a economizar cerca de 450g de resíduos alimentares nas últimas refeições. Obrigado!</p>
          </div>
        </div>

      </div>
    </Layout>
  );
}