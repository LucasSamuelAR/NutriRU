import { useState } from "react";
import { ClipboardCheck, Info, CheckCircle2 } from "lucide-react";
import LayoutGestor from "../../components/LayoutGestor";
import { supabase } from "../../lib/supabase";

export default function Producao() {
  const [turno, setTurno] = useState("almoco");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    previstas: "",
    servidas: "",
    sobras: "",
    descarte: "",
  });

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const diff =
    Number(form.previstas || 0) - Number(form.servidas || 0);

  const eficiencia =
    form.servidas && form.previstas
      ? (
          100 -
          (Number(form.descarte || 0) /
            Number(form.servidas || 1)) *
            100
        ).toFixed(1)
      : null;

  async function salvarProducao() {
    setShowConfirm(false);

    const { error } = await supabase
      .from("production_records")
      .insert([
        {
          data: new Date().toISOString().split("T")[0],
          turno,
          previstas: Number(form.previstas || 0),
          servidas: Number(form.servidas || 0),
          sobras: Number(form.sobras || 0),
          descarte: Number(form.descarte || 0),
        },
      ]);

    if (error) {
      console.log("ERRO AO SALVAR PRODUÇÃO:", error);
      return;
    }

    setShowSuccess(true);

    setForm({
      previstas: "",
      servidas: "",
      sobras: "",
      descarte: "",
    });

    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  }

  return (
    <LayoutGestor titulo="Fechamento de Turno" ativo="producao">
      <div className="space-y-5 pb-4">

        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>
            Fechamento de Turno
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Registre as métricas reais de produção do dia.
          </p>
        </div>

        {/* TURNOS */}
        <div className="bg-gray-100 rounded-2xl p-1 flex">
          <button
            onClick={() => setTurno("almoco")}
            className={`flex-1 py-3 rounded-xl font-semibold ${
              turno === "almoco"
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-400"
            }`}
          >
            Almoço
          </button>

          <button
            onClick={() => setTurno("jantar")}
            className={`flex-1 py-3 rounded-xl font-semibold ${
              turno === "jantar"
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-400"
            }`}
          >
            Jantar
          </button>
        </div>

        {/* CAMPOS */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "previstas", label: "PREVISTAS", unit: "un" },
            { key: "servidas", label: "SERVIDAS", unit: "un" },
            { key: "sobras", label: "SOBRAS", unit: "kg" },
            { key: "descarte", label: "DESCARTE", unit: "kg" },
          ].map(({ key, label, unit }) => (
            <div key={key}>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                {label}
              </p>

              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex justify-between">
                <input
                  type="number"
                  placeholder="0"
                  value={form[key]}
                  onChange={(e) =>
                    handleChange(key, e.target.value)
                  }
                  className="text-lg font-bold outline-none w-full"
                />
                <span className="text-sm text-gray-400">
                  {unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ANÁLISE */}
        {eficiencia && (
          <div className="bg-green-50 rounded-2xl p-4 border border-green-100 flex items-start gap-3">
            <Info size={18} className="text-green-700 mt-0.5" />

            <div>
              <p className="text-sm font-bold text-green-700">
                Análise Parcial
              </p>

              <p className="text-sm text-gray-600">
                Diferença de{" "}
                <strong>{Math.abs(diff)} refeições</strong> e eficiência de{" "}
                <strong>{eficiencia}%</strong>
              </p>
            </div>
          </div>
        )}

        {/* BOTÃO */}
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
          style={{ backgroundColor: "#166534" }}
        >
          <ClipboardCheck size={18} />
          Fechar de Turno
        </button>

        {/* MODAL CONFIRMAR */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm text-center space-y-4">

              <p className="text-lg font-bold">
                Confirmar fechamento?
              </p>

              <p className="text-sm text-gray-500">
                Turno: <strong>{turno}</strong>
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-gray-100"
                >
                  Cancelar
                </button>

                <button
                  onClick={salvarProducao}
                  className="flex-1 py-2 rounded-xl text-white"
                  style={{ backgroundColor: "#166534" }}
                >
                  Confirmar
                </button>
              </div>

            </div>
          </div>
        )}

        {/* MODAL SUCESSO */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm text-center space-y-4">

              <CheckCircle2
                size={44}
                className="text-green-700 mx-auto"
              />

              <p className="text-lg font-bold">
                Produção registrada com sucesso!
              </p>

              <button
                onClick={() => setShowSuccess(false)}
                className="w-full py-2 rounded-xl text-white font-bold"
                style={{ backgroundColor: "#166534" }}
              >
                Ok
              </button>

            </div>
          </div>
        )}

      </div>
    </LayoutGestor>
  );
}