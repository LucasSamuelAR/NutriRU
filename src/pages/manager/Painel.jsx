import { useEffect, useState, useRef } from "react";
import { Sun, Moon, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Zap, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LayoutGestor from "../../components/LayoutGestor";
import { supabase } from "../../lib/supabase";

function horaParaDecimal(str) {
  if (!str) return null;
  const [h, m] = str.split(":").map(Number);
  return h + m / 60;
}

function calcularNivel(pct) {
  if (pct > 100) return {
    label: "Superou a meta!",
    cor: "#166534",
    bg: "bg-green-50",
    border: "border-green-200",
    textCor: "text-green-700",
    Icon: Zap,
  };
  if (pct >= 95) return {
    label: "Altíssima adesão",
    cor: "#166534",
    bg: "bg-green-50",
    border: "border-green-200",
    textCor: "text-green-700",
    Icon: TrendingUp,
  };
  if (pct >= 80) return {
    label: "Grande adesão",
    cor: "#166534",
    bg: "bg-green-50",
    border: "border-green-100",
    textCor: "text-green-600",
    Icon: TrendingUp,
  };
  if (pct >= 70) return {
    label: "Boa parte confirmou",
    cor: "#ca8a04",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    textCor: "text-yellow-700",
    Icon: CheckCircle2,
  };
  if (pct >= 50) return {
    label: "Adesão moderada",
    cor: "#ea580c",
    bg: "bg-orange-50",
    border: "border-orange-200",
    textCor: "text-orange-600",
    Icon: AlertTriangle,
  };
  if (pct >= 30) return {
    label: "Baixa adesão",
    cor: "#ea580c",
    bg: "bg-orange-50",
    border: "border-orange-200",
    textCor: "text-orange-700",
    Icon: AlertTriangle,
  };
  return {
    label: "Nível crítico",
    cor: "#dc2626",
    bg: "bg-red-50",
    border: "border-red-200",
    textCor: "text-red-700",
    Icon: TrendingDown,
  };
}

export default function Painel() {
  const [confirmadas_almoco, setAlmoco] = useState(() => Number(localStorage.getItem("painel_almoco")) || 0);
  const [confirmadas_jantar, setJantar] = useState(() => Number(localStorage.getItem("painel_jantar")) || 0);
  const [config, setConfig] = useState(() => {
    const cached = localStorage.getItem("ru_config");
    return cached ? JSON.parse(cached) : null;
  });
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  const hora = new Date().getHours() + new Date().getMinutes() / 60;

  const almocoFechamento   = horaParaDecimal(config?.almoco_fechamento)       ?? 14;
  const jantarFechamento   = horaParaDecimal(config?.jantar_fechamento)       ?? 20;
  const intAlmocoLimite    = horaParaDecimal(config?.intencao_almoco_limite)   ?? 10.5;
  const intJantarLimite    = horaParaDecimal(config?.intencao_jantar_limite)   ?? 18.5;

  const turnoAtual = hora < almocoFechamento ? "almoco" : "jantar";

  const metaAlmoco = config?.meta_almoco ?? 500;
  const metaJantar = config?.meta_jantar ?? 300;
  const confirmadasTurno = turnoAtual === "almoco" ? confirmadas_almoco : confirmadas_jantar;
  const metaTurno = turnoAtual === "almoco" ? metaAlmoco : metaJantar;
  const adesao = metaTurno > 0 ? ((confirmadasTurno / metaTurno) * 100).toFixed(1) : 0;

  const intAlmocoInicio    = horaParaDecimal(config?.intencao_almoco_inicio)   ?? 6;
  const intJantarInicio    = horaParaDecimal(config?.intencao_jantar_inicio)   ?? 14;

  // Almoço: aparece quando intenções abrem, fica até o RU fechar
  const mostrarAdesaoAlmoco = hora >= intAlmocoInicio && hora < almocoFechamento && metaAlmoco > 0;
  const pctAlmoco = metaAlmoco > 0 ? (confirmadas_almoco / metaAlmoco) * 100 : 0;
  const nivelAlmoco = calcularNivel(pctAlmoco);

  // Jantar: aparece quando intenções abrem, fica até o RU fechar
  const mostrarAdesaoJantar = hora >= intJantarInicio && hora < jantarFechamento && metaJantar > 0;
  const pctJantar = metaJantar > 0 ? (confirmadas_jantar / metaJantar) * 100 : 0;
  const nivelJantar = calcularNivel(pctJantar);

  useEffect(() => {
    supabase.from("configuracoes").select("*").limit(1).single().then(({ data }) => {
      if (data) {
        setConfig(data);
        localStorage.setItem("ru_config", JSON.stringify(data));
      }
    });

    function load() {
      const hoje = new Date().toISOString().split("T")[0];
      supabase.from("meal_intentions").select("refeicao").eq("data", hoje).then(({ data, error }) => {
        if (error) return;
        const almoco = data?.filter((d) => d.refeicao === "almoco").length || 0;
        const jantar = data?.filter((d) => d.refeicao === "jantar").length || 0;
        setAlmoco(almoco);
        setJantar(jantar);
        localStorage.setItem("painel_almoco", almoco);
        localStorage.setItem("painel_jantar", jantar);
      });
    }

    load();
    intervalRef.current = setInterval(load, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  function BannerAdesao({ turno, confirmadas, meta, pct, nivel }) {
    const { Icon } = nivel;
    return (
      <div className={`${nivel.bg} rounded-2xl p-4 flex items-start gap-3 border ${nivel.border}`}>
        <Icon size={18} className={`${nivel.textCor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          <p className={`text-sm font-bold ${nivel.textCor}`}>
            {turno === "almoco" ? "Almoço" : "Jantar"} — {nivel.label}
          </p>
          <p className="text-sm text-gray-600">
            <strong>{confirmadas}</strong> de <strong>{meta}</strong> confirmações ({pct.toFixed(1)}% da meta)
          </p>
        </div>
      </div>
    );
  }

  return (
    <LayoutGestor titulo="Painel Geral" ativo="painel">
      <div className="space-y-4 pb-4">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>Painel do RU</h1>
            <p className="text-sm text-gray-500">Turno atual: <strong>{turnoAtual === "almoco" ? "Almoço" : "Jantar"}</strong></p>
          </div>
          <button onClick={() => navigate("/configuracoes")} className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Settings size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Cards de confirmações */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Almoço</p>
              <Sun size={16} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold" style={{ color: "#166534" }}>{confirmadas_almoco}</p>
            <p className="text-xs text-gray-400 mt-1">CONFIRMAÇÕES</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Jantar</p>
              <Moon size={16} className="text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-orange-500">{confirmadas_jantar}</p>
            <p className="text-xs text-gray-400 mt-1">CONFIRMAÇÕES</p>
          </div>
        </div>

        {/* Meta vs Real */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-4">
            Meta vs Confirmações ({turnoAtual === "almoco" ? "Almoço" : "Jantar"})
          </p>
          <div className="grid grid-cols-2 divide-x divide-gray-100 mb-4">
            <div className="text-center pr-4">
              <p className="text-sm text-gray-400">Meta</p>
              <p className="text-2xl font-bold">{metaTurno}</p>
            </div>
            <div className="text-center pl-4">
              <p className="text-sm text-gray-400">Confirmadas</p>
              <p className="text-2xl font-bold" style={{ color: "#166534" }}>{confirmadasTurno}</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${Math.min(adesao, 100)}%`, backgroundColor: "#166534" }}
            />
          </div>
          <div className="flex justify-between">
            <p className="text-xs text-gray-500">{adesao}% da meta</p>
            <p className="text-xs text-gray-400">
              {confirmadasTurno >= metaTurno ? "Meta atingida!" : `Faltam ${metaTurno - confirmadasTurno}`}
            </p>
          </div>
        </div>

        {/* Banner de adesão do almoço */}
        {mostrarAdesaoAlmoco && (
          <BannerAdesao
            turno="almoco"
            confirmadas={confirmadas_almoco}
            meta={metaAlmoco}
            pct={pctAlmoco}
            nivel={nivelAlmoco}
          />
        )}

        {/* Banner de adesão do jantar */}
        {mostrarAdesaoJantar && (
          <BannerAdesao
            turno="jantar"
            confirmadas={confirmadas_jantar}
            meta={metaJantar}
            pct={pctJantar}
            nivel={nivelJantar}
          />
        )}

      </div>
    </LayoutGestor>
  );
}