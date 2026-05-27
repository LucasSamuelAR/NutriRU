import { useState, useEffect } from "react";
import { ClipboardCheck, Info, CheckCircle2, Lock } from "lucide-react";
import LayoutGestor from "../../components/LayoutGestor";
import { supabase } from "../../lib/supabase";

const HOJE = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

function getTravados() {
  try {
    const raw = localStorage.getItem("ru_fechamento");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Limpa entradas de dias anteriores
    const limpo = {};
    for (const key of Object.keys(parsed)) {
      if (parsed[key] === HOJE) limpo[key] = HOJE;
    }
    return limpo;
  } catch {
    return {};
  }
}

function travarTurno(turno) {
  const atual = getTravados();
  atual[turno] = HOJE;
  localStorage.setItem("ru_fechamento", JSON.stringify(atual));
}

export default function Producao() {
  const [turno, setTurno] = useState("almoco");
  const [etapa, setEtapa] = useState("form"); // "form" | "revisao" | "sucesso"
  const [travados, setTravados] = useState({});

  const [form, setForm] = useState({
    previstas: "",
    servidas: "",
    sobras: "",
    descarte: "",
  });

  useEffect(() => {
    setTravados(getTravados());
  }, []);

  // Quando trocar de turno, volta pra o form
  function mudarTurno(t) {
    setTurno(t);
    setEtapa("form");
    setForm({ previstas: "", servidas: "", sobras: "", descarte: "" });
  }

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const diff = Number(form.previstas || 0) - Number(form.servidas || 0);

  const eficiencia =
    form.servidas && form.previstas
      ? (
          100 -
          (Number(form.descarte || 0) / Number(form.servidas || 1)) * 100
        ).toFixed(1)
      : null;

  async function salvarProducao() {
    const { error } = await supabase.from("production_records").insert([
      {
        data: HOJE,
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

    travarTurno(turno);
    setTravados(getTravados());
    setEtapa("sucesso");
  }

  const travado = !!travados[turno];
  const turnoLabel = turno === "almoco" ? "Almoço" : "Jantar";

  // ─── Etapa: SUCESSO ───────────────────────────────────────────────────────────
  if (etapa === "sucesso") {
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

          {/* Seletor de turno */}
          <div className="bg-gray-100 rounded-2xl p-1 flex">
            {["almoco", "jantar"].map((t) => (
              <button
                key={t}
                onClick={() => mudarTurno(t)}
                className={`flex-1 py-3 rounded-xl font-semibold ${
                  turno === t
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-400"
                }`}
              >
                {t === "almoco" ? "Almoço" : "Jantar"}
              </button>
            ))}
          </div>

          <div className="bg-green-50 rounded-2xl p-6 flex flex-col items-center gap-3 border border-green-100">
            <CheckCircle2 size={48} className="text-green-700" />
            <p className="text-lg font-bold text-green-800 text-center">
              {turnoLabel} registrado com sucesso!
            </p>
            <p className="text-sm text-gray-500 text-center">
              O fechamento deste turno está bloqueado até amanhã.
            </p>
          </div>
        </div>
      </LayoutGestor>
    );
  }

  // ─── Etapa: REVISÃO ───────────────────────────────────────────────────────────
  if (etapa === "revisao") {
    const itens = [
      { label: "Refeições previstas", valor: `${form.previstas || 0} un` },
      { label: "Refeições servidas", valor: `${form.servidas || 0} un` },
      { label: "Sobras", valor: `${form.sobras || 0} kg` },
      { label: "Descarte", valor: `${form.descarte || 0} kg` },
    ];

    return (
      <LayoutGestor titulo="Fechamento de Turno" ativo="producao">
        <div className="space-y-5 pb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>
              Revisar Fechamento
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Confira os dados antes de confirmar. Esta ação não pode ser desfeita.
            </p>
          </div>

          {/* Badge turno */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white px-3 py-1 rounded-full"
              style={{ backgroundColor: "#166534" }}>
              {turnoLabel}
            </span>
            <span className="text-sm text-gray-400">{HOJE}</span>
          </div>

          {/* Tabela de revisão */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {itens.map(({ label, valor }, i) => (
              <div
                key={label}
                className={`flex justify-between items-center px-4 py-3 ${
                  i < itens.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-bold text-gray-800">{valor}</span>
              </div>
            ))}
          </div>

          {/* Análise */}
          {eficiencia && (
            <div className="bg-green-50 rounded-2xl p-4 border border-green-100 flex items-start gap-3">
              <Info size={18} className="text-green-700 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-700">Análise</p>
                <p className="text-sm text-gray-600">
                  Diferença de <strong>{Math.abs(diff)} refeições</strong> e
                  eficiência de <strong>{eficiencia}%</strong>
                </p>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3">
            <button
              onClick={() => setEtapa("form")}
              className="flex-1 py-4 rounded-2xl bg-gray-100 font-semibold text-gray-600"
            >
              Voltar
            </button>
            <button
              onClick={salvarProducao}
              className="flex-1 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
              style={{ backgroundColor: "#166534" }}
            >
              <ClipboardCheck size={18} />
              Confirmar
            </button>
          </div>
        </div>
      </LayoutGestor>
    );
  }

  // ─── Etapa: FORM ─────────────────────────────────────────────────────────────
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
          {["almoco", "jantar"].map((t) => (
            <button
              key={t}
              onClick={() => mudarTurno(t)}
              className={`flex-1 py-3 rounded-xl font-semibold ${
                turno === t
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-400"
              }`}
            >
              {t === "almoco" ? "Almoço" : "Jantar"}
            </button>
          ))}
        </div>

        {/* TRAVADO */}
        {travado ? (
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 flex flex-col items-center gap-3 text-center">
            <Lock size={32} className="text-gray-400" />
            <p className="font-semibold text-gray-600">
              {turnoLabel} já foi fechado hoje
            </p>
            <p className="text-sm text-gray-400">
              O registro deste turno só poderá ser feito novamente amanhã.
            </p>
          </div>
        ) : (
          <>
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
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex justify-between items-center">
                    <input
                      type="number"
                      placeholder="0"
                      value={form[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="text-lg font-bold outline-none w-full"
                    />
                    <span className="text-sm text-gray-400">{unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ANÁLISE PARCIAL */}
            {eficiencia && (
              <div className="bg-green-50 rounded-2xl p-4 border border-green-100 flex items-start gap-3">
                <Info size={18} className="text-green-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-green-700">
                    Análise Parcial
                  </p>
                  <p className="text-sm text-gray-600">
                    Diferença de <strong>{Math.abs(diff)} refeições</strong> e
                    eficiência de <strong>{eficiencia}%</strong>
                  </p>
                </div>
              </div>
            )}

            {/* BOTÃO → vai pra revisão */}
            <button
              onClick={() => setEtapa("revisao")}
              className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
              style={{ backgroundColor: "#166534" }}
            >
              <ClipboardCheck size={18} />
              Fechar Turno
            </button>
          </>
        )}

      </div>
    </LayoutGestor>
  );
}