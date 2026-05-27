import { useState, useEffect, useRef } from "react";
import { Save, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LayoutGestor from "../../components/LayoutGestor";
import { supabase } from "../../lib/supabase";

const camposAlmoco = [
  { key: "almoco_abertura",        label: "Abertura do Almoço" },
  { key: "almoco_fechamento",      label: "Fechamento do Almoço" },
  { key: "intencao_almoco_inicio", label: "Início das Confirmações (Almoço)" },
  { key: "intencao_almoco_limite", label: "Limite das Confirmações (Almoço)" },
];

const camposJantar = [
  { key: "jantar_abertura",        label: "Abertura do Jantar" },
  { key: "jantar_fechamento",      label: "Fechamento do Jantar" },
  { key: "intencao_jantar_inicio", label: "Início das Confirmações (Jantar)" },
  { key: "intencao_jantar_limite", label: "Limite das Confirmações (Jantar)" },
];

export default function Configuracoes() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    almoco_abertura: "", almoco_fechamento: "",
    jantar_abertura: "", jantar_fechamento: "",
    intencao_almoco_inicio: "", intencao_almoco_limite: "",
    intencao_jantar_inicio: "", intencao_jantar_limite: "",
    meta_almoco: "", meta_jantar: "",
  });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const configIdRef = useRef(null);

  useEffect(() => {
    supabase.from("configuracoes").select("*").limit(1).single().then(({ data, error }) => {
      if (error) { console.error(error); setLoading(false); return; }
      configIdRef.current = data.id;
      setForm({
        almoco_abertura:        data.almoco_abertura?.slice(0, 5)        || "",
        almoco_fechamento:      data.almoco_fechamento?.slice(0, 5)      || "",
        jantar_abertura:        data.jantar_abertura?.slice(0, 5)        || "",
        jantar_fechamento:      data.jantar_fechamento?.slice(0, 5)      || "",
        intencao_almoco_inicio: data.intencao_almoco_inicio?.slice(0, 5) || "",
        intencao_almoco_limite: data.intencao_almoco_limite?.slice(0, 5) || "",
        intencao_jantar_inicio: data.intencao_jantar_inicio?.slice(0, 5) || "",
        intencao_jantar_limite: data.intencao_jantar_limite?.slice(0, 5) || "",
        meta_almoco: data.meta_almoco ?? 500,
        meta_jantar: data.meta_jantar ?? 300,
      });
      localStorage.setItem("ru_config", JSON.stringify(data));
      setLoading(false);
    });
  }, []);

  async function handleSalvar() {
    if (!configIdRef.current) { console.error("ID não encontrado"); return; }

    const payload = {
      almoco_abertura:        form.almoco_abertura        ? form.almoco_abertura        + ":00" : null,
      almoco_fechamento:      form.almoco_fechamento      ? form.almoco_fechamento      + ":00" : null,
      jantar_abertura:        form.jantar_abertura        ? form.jantar_abertura        + ":00" : null,
      jantar_fechamento:      form.jantar_fechamento      ? form.jantar_fechamento      + ":00" : null,
      intencao_almoco_inicio: form.intencao_almoco_inicio ? form.intencao_almoco_inicio + ":00" : null,
      intencao_almoco_limite: form.intencao_almoco_limite ? form.intencao_almoco_limite + ":00" : null,
      intencao_jantar_inicio: form.intencao_jantar_inicio ? form.intencao_jantar_inicio + ":00" : null,
      intencao_jantar_limite: form.intencao_jantar_limite ? form.intencao_jantar_limite + ":00" : null,
      meta_almoco: Number(form.meta_almoco) || 500,
      meta_jantar: Number(form.meta_jantar) || 300,
    };

    const { data: updated, error } = await supabase
      .from("configuracoes")
      .update(payload)
      .eq("id", configIdRef.current)
      .select()
      .single();

    if (error) {
      console.error("Erro ao salvar:", error);
      setToast({ tipo: "erro", msg: "Erro ao salvar. Tente novamente." });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    localStorage.setItem("ru_config", JSON.stringify(updated));
    setToast({ tipo: "sucesso", msg: "Configurações salvas com sucesso!" });
    setTimeout(() => {
      setToast(null);
      navigate("/painel");
    }, 2000);
  }

  if (loading) return (
    <LayoutGestor titulo="Configurações" ativo="configuracoes">
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-400">Carregando...</p>
      </div>
    </LayoutGestor>
  );

  return (
    <LayoutGestor titulo="Configurações" ativo="configuracoes">
      <div className="space-y-4 pb-4">

        {toast && (
          <div
            className="fixed top-4 left-4 right-4 z-50 px-4 py-3 rounded-2xl text-white text-sm font-semibold shadow-lg flex items-center gap-2"
            style={{ backgroundColor: toast.tipo === "sucesso" ? "#166534" : "#dc2626" }}
          >
            {toast.tipo === "sucesso" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toast.msg}
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>Configurações</h1>
          <p className="text-sm text-gray-500 mt-0.5">Horários de funcionamento do RU</p>
        </div>

        {/* ALMOÇO */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
              <Clock size={16} style={{ color: "#166534" }} />
            </div>
            <p className="text-sm font-bold text-gray-900">Almoço</p>
          </div>
          {camposAlmoco.map(({ key, label }) => (
            <div key={key}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">{label}</p>
              <input
                type="time"
                value={form[key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm text-gray-900 outline-none border border-transparent focus:border-green-200"
              />
            </div>
          ))}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Meta de Refeições</p>
            <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center justify-between border border-transparent focus-within:border-green-200">
              <input
                type="number"
                value={form.meta_almoco}
                onChange={(e) => setForm((prev) => ({ ...prev, meta_almoco: e.target.value }))}
                className="bg-transparent outline-none text-sm text-gray-900 font-medium w-full"
                placeholder="500"
              />
              <span className="text-xs text-gray-400 ml-2">refeições</span>
            </div>
          </div>
        </div>

        {/* JANTAR */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
              <Clock size={16} className="text-orange-500" />
            </div>
            <p className="text-sm font-bold text-gray-900">Jantar</p>
          </div>
          {camposJantar.map(({ key, label }) => (
            <div key={key}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">{label}</p>
              <input
                type="time"
                value={form[key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm text-gray-900 outline-none border border-transparent focus:border-green-200"
              />
            </div>
          ))}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Meta de Refeições</p>
            <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center justify-between border border-transparent focus-within:border-orange-200">
              <input
                type="number"
                value={form.meta_jantar}
                onChange={(e) => setForm((prev) => ({ ...prev, meta_jantar: e.target.value }))}
                className="bg-transparent outline-none text-sm text-gray-900 font-medium w-full"
                placeholder="300"
              />
              <span className="text-xs text-gray-400 ml-2">refeições</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSalvar}
          className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2"
          style={{ backgroundColor: "#166534" }}
        >
          <Save size={18} />
          Salvar Configurações
        </button>

      </div>
    </LayoutGestor>
  );
}