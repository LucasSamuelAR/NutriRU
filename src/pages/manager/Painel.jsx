import { Sun, Moon, AlertTriangle, ChefHat, Users } from "lucide-react";
import LayoutGestor from "../../components/LayoutGestor";

const confirmadas_almoco = 482;
const confirmadas_jantar = 315;
const adesaoHistorica = 0.87;
const metaDiaria = 500;

const adesao = ((confirmadas_almoco / metaDiaria) * 100).toFixed(1);
const adesaoJantar = ((confirmadas_jantar / confirmadas_almoco) * 100).toFixed(0);
const alertaJantar = confirmadas_jantar < confirmadas_almoco * 0.6;
const recomendacaoAlmoco = Math.round(confirmadas_almoco / adesaoHistorica);
const recomendacaoJantar = Math.round(confirmadas_jantar / adesaoHistorica);

const semDados = confirmadas_almoco === 0 && confirmadas_jantar === 0;

export default function Painel() {
  return (
    <LayoutGestor titulo="Painel Geral" ativo="painel">
      <div className="space-y-4 pb-4">

        {/* Saudação */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>Olá, Gestor!</h1>
          <p className="text-sm text-gray-500">Segunda-feira, 14 de Outubro</p>
        </div>

        {/* Cards intenções */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Almoço</p>
              <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                <Sun size={16} className="text-green-600" />
              </div>
            </div>
            {semDados ? (
              <p className="text-2xl font-bold text-gray-300">--</p>
            ) : (
              <p className="text-3xl font-bold" style={{ color: "#166534" }}>{confirmadas_almoco}</p>
            )}
            <p className="text-xs font-semibold text-gray-400 tracking-wide mt-1">PRESENÇAS CONFIRMADAS</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Jantar</p>
              <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center">
                <Moon size={16} className="text-orange-500" />
              </div>
            </div>
            {semDados ? (
              <p className="text-2xl font-bold text-gray-300">--</p>
            ) : (
              <p className="text-3xl font-bold text-orange-500">{confirmadas_jantar}</p>
            )}
            <p className="text-xs font-semibold text-gray-400 tracking-wide mt-1">PRESENÇAS CONFIRMADAS</p>
          </div>
        </div>

        {/* Estado vazio */}
        {semDados ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Users size={20} className="text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Nenhuma confirmação ainda</p>
              <p className="text-xs text-gray-400 mt-1">O cardápio de hoje está publicado? Estudantes confirmam até às 09:00 para o almoço.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Meta vs Real */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Refeições de hoje</p>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Meta vs Real</span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-100 mb-4">
                <div className="text-center pr-4">
                  <p className="text-sm text-gray-400">Meta do dia</p>
                  <p className="text-2xl font-bold text-gray-900">{metaDiaria}</p>
                </div>
                <div className="text-center pl-4">
                  <p className="text-sm text-gray-400">Confirmadas</p>
                  <p className="text-2xl font-bold" style={{ color: "#166534" }}>{confirmadas_almoco}</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(adesao, 100)}%`, backgroundColor: "#166534" }}
                />
              </div>
              <div className="flex justify-between">
                <p className="text-xs text-gray-500">{adesao}% da meta confirmada</p>
                <p className="text-xs text-gray-400">Faltam {metaDiaria - confirmadas_almoco}</p>
              </div>
            </div>

            {/* Alerta de adesão baixa */}
            {alertaJantar && (
              <div className="bg-orange-50 rounded-2xl p-4 flex items-start gap-3 border border-orange-100">
                <AlertTriangle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-orange-600 mb-1">Adesão baixa no Jantar</p>
                  <p className="text-sm text-gray-600">
                    Apenas <strong>{adesaoJantar}%</strong> dos estudantes que confirmaram almoço também confirmaram o jantar. Considere ajustar a produção para evitar desperdício.
                  </p>
                </div>
              </div>
            )}

            {/* Recomendação de produção */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4" style={{ borderLeftColor: "#166534" }}>
              <div className="flex items-center gap-2 mb-3">
                <ChefHat size={18} style={{ color: "#166534" }} />
                <p className="text-sm font-bold" style={{ color: "#166534" }}>Recomendação de Produção</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Sun size={14} className="text-green-600" />
                    <p className="text-sm text-gray-600">Almoço</p>
                  </div>
                  <p className="text-sm font-bold" style={{ color: "#166534" }}>{recomendacaoAlmoco} refeições</p>
                </div>
                <div className="flex items-center justify-between bg-orange-50 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Moon size={14} className="text-orange-500" />
                    <p className="text-sm text-gray-600">Jantar</p>
                  </div>
                  <p className="text-sm font-bold text-orange-500">{recomendacaoJantar} refeições</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Calculado com base nas confirmações do dia e na taxa histórica de adesão de <strong>{(adesaoHistorica * 100).toFixed(0)}%</strong>. Produzir acima das confirmações garante atendimento sem desperdício excessivo.
              </p>
            </div>
          </>
        )}
      </div>
    </LayoutGestor>
  );
}