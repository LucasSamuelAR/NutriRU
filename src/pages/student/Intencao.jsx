import { useState } from "react";
import { Sun, Moon, Sparkles, Clock, Lock } from "lucide-react";
import Layout from "../../components/Layout";

const LIMITE_ALMOCO = 9;  // 09:00
const LIMITE_JANTAR = 15; // 15:00

const horaAtual = new Date().getHours();
const almocoEncerrado = horaAtual >= LIMITE_ALMOCO;
const jantarEncerrado = horaAtual >= LIMITE_JANTAR;

export default function Intencao() {
  const [almoco, setAlmoco] = useState(true);
  const [jantar, setJantar] = useState(false);

  return (
    <Layout titulo="Intenção de Refeição" ativo="intencao">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>Vai comer no RU hoje?</h1>
          <p className="text-sm text-gray-500 mt-1">
            Confirme sua presença com antecedência para ajudar a gestão a calcular a quantidade de comida e evitar o desperdício.
          </p>
        </div>

        {/* Card Almoço */}
        <div className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${almoco ? "border-green-700" : "border-gray-100"} ${almocoEncerrado ? "opacity-75" : ""}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${almoco && !almocoEncerrado ? "bg-green-700" : "bg-gray-100"}`}>
                <Sun size={20} className={almoco && !almocoEncerrado ? "text-white" : "text-gray-400"} />
              </div>
              <div>
                <p className="font-bold text-gray-900">Almoço</p>
                <p className="text-xs text-gray-500">Hoje, das 11:30 às 14:00</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock size={11} className={almocoEncerrado ? "text-red-400" : "text-orange-400"} />
                  <p className={`text-xs font-medium ${almocoEncerrado ? "text-red-400" : "text-orange-400"}`}>
                    {almocoEncerrado ? "Confirmações encerradas" : `Confirmar até às 09:00`}
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
            <p className="text-sm text-gray-500">
              Status:{" "}
              <span className={almoco && !almocoEncerrado ? "text-green-700 font-medium" : "text-gray-400"}>
                {almocoEncerrado ? "Encerrado" : almoco ? "Confirmado" : "Não confirmado"}
              </span>
            </p>
            {almocoEncerrado ? (
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl">
                Prazo encerrado
              </span>
            ) : (
              <button
                onClick={() => setAlmoco(!almoco)}
                className={`text-sm font-semibold px-4 py-1.5 rounded-xl transition-all ${almoco ? "text-orange-500" : "bg-green-50 text-green-700"}`}
              >
                {almoco ? "Cancelar Confirmação" : "Confirmar Almoço"}
              </button>
            )}
          </div>
        </div>

        {/* Card Jantar */}
        <div className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${jantar ? "border-green-700" : "border-gray-100"} ${jantarEncerrado ? "opacity-75" : ""}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${jantar && !jantarEncerrado ? "bg-green-700" : "bg-gray-100"}`}>
                <Moon size={20} className={jantar && !jantarEncerrado ? "text-white" : "text-gray-400"} />
              </div>
              <div>
                <p className="font-bold text-gray-900">Jantar</p>
                <p className="text-xs text-gray-500">Hoje, das 17:30 às 20:00</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock size={11} className={jantarEncerrado ? "text-red-400" : "text-orange-400"} />
                  <p className={`text-xs font-medium ${jantarEncerrado ? "text-red-400" : "text-orange-400"}`}>
                    {jantarEncerrado ? "Confirmações encerradas" : `Confirmar até às 15:00`}
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
            <p className="text-sm text-gray-500">
              Status:{" "}
              <span className={jantar && !jantarEncerrado ? "text-green-700 font-medium" : "text-gray-400"}>
                {jantarEncerrado ? "Encerrado" : jantar ? "Confirmado" : "Não confirmado"}
              </span>
            </p>
            {jantarEncerrado ? (
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl">
                Prazo encerrado
              </span>
            ) : (
              <button
                onClick={() => setJantar(!jantar)}
                className={`text-sm font-semibold px-4 py-1.5 rounded-xl transition-all ${jantar ? "text-orange-500" : "bg-green-50 text-green-700"}`}
              >
                {jantar ? "Cancelar Confirmação" : "Confirmar Jantar"}
              </button>
            )}
          </div>
        </div>

        {/* Card impacto */}
        <div className="bg-gray-100 rounded-2xl p-4 flex items-start gap-3">
          <Sparkles size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-gray-900">Seu impacto esta semana</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Ao confirmar, você ajudou a economizar cerca de 450g de resíduos alimentares nas últimas refeições. Obrigado!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}