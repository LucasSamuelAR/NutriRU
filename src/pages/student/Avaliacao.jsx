import { useState } from "react";
import { Star } from "lucide-react";
import Layout from "../../components/Layout";

const criterios = [
  { key: "sabor", label: "Sabor da Comida" },
  { key: "temperatura", label: "Temperatura dos Pratos" },
  { key: "aparencia", label: "Aparência e Apresentação" },
  { key: "satisfacao", label: "Satisfação Geral" },
];

export default function Avaliacao() {
  const [notas, setNotas] = useState({ sabor: 0, temperatura: 0, aparencia: 0, satisfacao: 0 });
  const [comentario, setComentario] = useState("");

  function setNota(key, valor) {
    setNotas((prev) => ({ ...prev, [key]: valor }));
  }

  return (
    <Layout titulo="Avaliação da Refeição" ativo="avaliar">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>O que achou do Almoço?</h1>
          <p className="text-sm text-gray-500 mt-1">
            Seu feedback é anônimo e ajuda a equipe de nutrição a melhorar o cardápio e os processos diariamente.
          </p>
        </div>

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

        <div className="bg-white rounded-2xl px-4 py-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-3">Comentários ou Sugestões (Opcional)</p>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Ex: O purê de batata estava ótimo, mas as iscas de carne estavam um pouco salgadas..."
            className="w-full text-sm text-gray-600 placeholder-gray-400 border border-gray-100 rounded-xl p-3 resize-none outline-none focus:border-green-300"
            rows={3}
          />
        </div>

        <button className="w-full py-4 rounded-2xl text-white font-bold text-base" style={{ backgroundColor: "#166534" }}>
          Enviar Avaliação
        </button>

        <p className="text-center text-xs text-gray-400">
          Você pode avaliar até 1 hora após o encerramento do turno.
        </p>
      </div>
    </Layout>
  );
}