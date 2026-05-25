import { useState } from "react";
import { ClipboardCheck, Info } from "lucide-react";
import LayoutGestor from "../../components/LayoutGestor";

export default function Producao() {
  const [turno, setTurno] = useState("almoco");
  const [form, setForm] = useState({ previstas: "500", servidas: "482", sobras: "4.5", descarte: "1.2" });

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const diff = Number(form.previstas) - Number(form.servidas);
  const eficiencia = form.servidas && form.previstas
    ? (100 - (Number(form.descarte) / Number(form.servidas)) * 100).toFixed(1)
    : null;

  return (
    <LayoutGestor titulo="Registro de Produção" ativo="producao">
      <div className="space-y-5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fechamento de Turno</h1>
          <p className="text-sm text-gray-500 mt-1">Registre as métricas reais de produção do dia para calcular o desperdício.</p>
        </div>

        {/* Seletor de turno */}
        <div>
          <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-2">Selecione o turno</p>
          <div className="bg-gray-100 rounded-2xl p-1 flex">
            <button
              onClick={() => setTurno("almoco")}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${turno === "almoco" ? "bg-white text-green-700 shadow-sm" : "text-gray-400"}`}
            >
              Almoço
            </button>
            <button
              onClick={() => setTurno("jantar")}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${turno === "jantar" ? "bg-white text-green-700 shadow-sm" : "text-gray-400"}`}
            >
              Jantar
            </button>
          </div>
        </div>

        {/* Campos */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "previstas", label: "PREVISTAS",    unit: "unidades" },
            { key: "servidas",  label: "SERVIDAS",     unit: "unidades" },
            { key: "sobras",    label: "SOBRAS (KG)",  unit: "kg" },
            { key: "descarte",  label: "DESCARTE (KG)",unit: "kg" },
          ].map(({ key, label, unit }) => (
            <div key={key}>
              <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-2">{label}</p>
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between">
                <input
                  type="number"
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="text-lg font-bold text-gray-900 outline-none w-full"
                />
                <span className="text-sm text-gray-400 ml-1">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Análise */}
        {eficiencia && (
          <div className="bg-green-50 rounded-2xl p-4 flex items-start gap-3 border border-green-100">
            <Info size={18} className="text-green-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-green-700 mb-1">Análise Parcial de Sobras</p>
              <p className="text-sm text-gray-600">
                Foram servidas <strong>{Math.abs(diff)} refeições {diff > 0 ? "a menos" : "a mais"}</strong> do que o previsto. O descarte de <strong>{form.descarte} kg</strong> representa um índice de eficiência de {eficiencia}%. {Number(eficiencia) > 95 ? "Excelente controle de estoque!" : "Há espaço para melhorar."}
              </p>
            </div>
          </div>
        )}

        {/* Botão */}
        <button
          className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2"
          style={{ backgroundColor: "#166534" }}
        >
          <ClipboardCheck size={18} />
          Registrar Produção
        </button>
      </div>
    </LayoutGestor>
  );
}