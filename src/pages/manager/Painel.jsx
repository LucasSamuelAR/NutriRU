import { useEffect, useState } from "react";
import { Sun, Moon, AlertTriangle, ChefHat, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LayoutGestor from "../../components/LayoutGestor";
import { supabase } from "../../lib/supabase";

export default function Painel() {
  const [confirmadas_almoco, setAlmoco] = useState(0);
  const [confirmadas_jantar, setJantar] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const hora = new Date().getHours();
  const turnoAtual = hora < 15 ? "almoco" : "jantar";

  const metaAlmoco = 500;
  const metaJantar = 300;

  const confirmadasTurno = turnoAtual === "almoco" ? confirmadas_almoco : confirmadas_jantar;
  const metaTurno = turnoAtual === "almoco" ? metaAlmoco : metaJantar;
  const adesao = metaTurno > 0 ? ((confirmadasTurno / metaTurno) * 100).toFixed(1) : 0;
  const alertaJantar = confirmadas_jantar < confirmadas_almoco * 0.6;
  const adesaoJantar = confirmadas_almoco > 0 ? ((confirmadas_jantar / confirmadas_almoco) * 100).toFixed(0) : 0;
  const taxaPresenca = 0.85;
  const recomendacaoAlmoco = Math.round(confirmadas_almoco / taxaPresenca);
  const recomendacaoJantar = Math.round(confirmadas_jantar / taxaPresenca);

  async function load() {
    const hoje = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase.from("meal_intentions").select("refeicao").eq("data", hoje);
    if (error) { setLoading(false); return; }
    setAlmoco(data?.filter((d) => d.refeicao === "almoco").length || 0);
    setJantar(data?.filter((d) => d.refeicao === "jantar").length || 0);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <LayoutGestor titulo="Painel Geral" ativo="painel">
      <div className="space-y-4 pb-4">

        {/* SAUDAÇÃO */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>Olá, Gestor!</h1>
            <p className="text-sm text-gray-500">
              Turno atual: <strong>{turnoAtual === "almoco" ? "Almoço" : "Jantar"}</strong>
            </p>
          </div>
          <button
            onClick={() => navigate("/configuracoes")}
            className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center"
          >
            <Settings size={18} className="text-gray-500" />
          </button>
        </div>

        {/* CARDS */}
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

        {/* META VS REAL */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase">Meta vs Real ({turnoAtual})</p>
          </div>
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
            <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(adesao, 100)}%`, backgroundColor: "#166534" }} />
          </div>
          <div className="flex justify-between">
            <p className="text-xs text-gray-500">{adesao}% da meta</p>
            <p className="text-xs text-gray-400">Faltam {metaTurno - confirmadasTurno}</p>
          </div>
        </div>

        {/* ALERTA JANTAR */}
        {alertaJantar && (
          <div className="bg-orange-50 rounded-2xl p-4 flex items-start gap-3 border border-orange-100">
            <AlertTriangle size={18} className="text-orange-500 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-orange-600">Adesão baixa no Jantar</p>
              <p className="text-sm text-gray-600">
                Apenas <strong>{adesaoJantar}%</strong> dos alunos do almoço confirmaram jantar.
              </p>
            </div>
          </div>
        )}

        {/* RECOMENDAÇÃO */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4" style={{ borderLeftColor: "#166534" }}>
          <div className="flex items-center gap-2 mb-3">
            <ChefHat size={18} style={{ color: "#166534" }} />
            <p className="text-sm font-bold" style={{ color: "#166534" }}>Recomendação de Produção</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between bg-green-50 rounded-xl px-3 py-2">
              <p className="text-sm text-gray-600">Almoço</p>
              <p className="text-sm font-bold" style={{ color: "#166534" }}>{recomendacaoAlmoco}</p>
            </div>
            <div className="flex justify-between bg-orange-50 rounded-xl px-3 py-2">
              <p className="text-sm text-gray-600">Jantar</p>
              <p className="text-sm font-bold text-orange-500">{recomendacaoJantar}</p>
            </div>
          </div>
        </div>

      </div>
    </LayoutGestor>
  );
}