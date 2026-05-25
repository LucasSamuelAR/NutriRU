import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Layout from "../../components/Layout";

const cardapio = {
  almoco: [
    { categoria: "PRATO PRINCIPAL", nome: "Iscas de Carne Acebolada", kcal: 285 },
    { categoria: "OPÇÃO VEGETARIANA", nome: "Estrogonofe de Grão de Bico", kcal: 240 },
    { categoria: "ACOMPANHAMENTOS", nome: "Arroz Integral, Feijão Preto e Purê", kcal: 195 },
    { categoria: "SOBREMESA & SALADA", nome: "Mix de Folhas e Laranja Fresca", kcal: 95 },
  ],
  jantar: [
    { categoria: "PRATO PRINCIPAL", nome: "Frango Grelhado ao Limão", kcal: 260 },
    { categoria: "OPÇÃO VEGETARIANA", nome: "Omelete de Legumes", kcal: 180 },
    { categoria: "ACOMPANHAMENTOS", nome: "Arroz Branco e Feijão Carioca", kcal: 190 },
    { categoria: "SOBREMESA & SALADA", nome: "Frutas da Estação", kcal: 80 },
  ],
};

const categoriaConfig = {
  "PRATO PRINCIPAL":    { bg: "bg-orange-50", text: "text-orange-500" },
  "OPÇÃO VEGETARIANA":  { bg: "bg-green-50",  text: "text-green-600" },
  "ACOMPANHAMENTOS":    { bg: "bg-green-50",  text: "text-green-700" },
  "SOBREMESA & SALADA": { bg: "bg-green-50",  text: "text-green-600" },
};

export default function Inicio() {
  const [turno, setTurno] = useState("almoco");

  return (
    <Layout titulo="NutriRU" ativo="inicio">
      <div className="space-y-4">
        {/* Saudação */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>Olá, Mariana!</h1>
            <p className="text-sm text-gray-500">Segunda-feira, 14 de Outubro</p>
          </div>
          <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full border border-green-200">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            RU Aberto
          </span>
        </div>

        {/* Banner presença confirmada */}
        <div className="bg-green-700 rounded-2xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={22} className="text-white flex-shrink-0" />
            <div>
              <p className="text-green-200 text-xs">Sua presença de hoje</p>
              <p className="text-white font-bold text-sm">Almoço confirmado para hoje!</p>
            </div>
          </div>
          <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            12h - 14h
          </span>
        </div>

        {/* Cardápio */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Cardápio do dia</p>
            <div className="flex gap-1 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setTurno("almoco")}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${turno === "almoco" ? "bg-green-700 text-white" : "text-gray-500"}`}
              >
                Almoço
              </button>
              <button
                onClick={() => setTurno("jantar")}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${turno === "jantar" ? "bg-green-700 text-white" : "text-gray-500"}`}
              >
                Jantar
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {cardapio[turno].map((item, i) => {
              const config = categoriaConfig[item.categoria];
              return (
                <div key={i} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
                  <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <span className={`text-xs font-bold ${config.text}`}>{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold tracking-wide uppercase ${config.text}`}>{item.categoria}</p>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{item.nome}</p>
                  </div>
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0">
                    {item.kcal} kcal
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}