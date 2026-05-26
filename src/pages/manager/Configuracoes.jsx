import { useState, useEffect } from "react";
import { Save, Clock, CheckCircle } from "lucide-react";
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
  const [form, setForm] = useState({
    almoco_abertura: "",
    almoco_fechamento: "",
    jantar_abertura: "",
    jantar_fechamento: "",
    intencao_almoco_inicio: "",
    intencao_almoco_limite: "",
    intencao_jantar_inicio: "",
    intencao_jantar_limite: "",
  });
  const [id, setId] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarConfiguracoes();
  }, []);

  async function buscarConfiguracoes() {
    const { data, error } = await supabase.from("configuracoes").select("*").limit(1).single();
    if (error) { console.error(error); setLoading(false); return; }
    setId(data.id);
    setForm({
      almoco_abertura:        data.almoco_abertura?.slice(0, 5) || "",
      almoco_fechamento:      data.almoco_fechamento?.slice(0, 5) || "",
      jantar_abertura:        data.jantar_abertura?.slice(0, 5) || "",
      jantar_fechamento:      data.jantar_fechamento?.slice(0, 5) || "",
      intencao_almoco_inicio: data.intencao_almoco_inicio?.slice(0, 5) || "",
      intencao_almoco_limite: data.intencao_almoco_limite?.slice(0, 5) || "",
      intencao_jantar_inicio: data.intencao_jantar_inicio?.slice(0, 5) || "",
      intencao_jantar_limite: data.intencao_jantar_limite?.slice(0, 5) || "",
    });
    setLoading(false);
  }

  async function handleSalvar() {
    const { error } = await supabase.from("configuracoes").update(form).eq("id", id);
    if (error) { console.error(error); return; }
    setToast("Configurações salvas com sucesso!");
    setTimeout(() => setToast(null), 3000);
  }

  function Campo({ campo }) {
    return (
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">{campo.label}</p>
        <input
          type="time"
          value={form[campo.key]}
          onChange={(e) => setForm((prev) => ({ ...prev, [campo.key]: e.target.value }))}
          className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm text-gray-900 outline-none border border-transparent focus:border-green-200"
        />
      </div>
    );
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

        {/* Toast */}
        {toast && (
          <div className="fixed top-4 left-4 right-4 z-50 px-4 py-3 rounded-2xl text-white text-sm font-semibold shadow-lg flex items-center gap-2" style={{ backgroundColor: "#166534" }}>
            <CheckCircle size={16} />
            {toast}
          </div>
        )}

        {/* Título */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>Configurações</h1>
          <p className="text-sm text-gray-500 mt-0.5">Horários de funcionamento do RU</p>
        </div>

        {/* Almoço */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
              <Clock size={16} style={{ color: "#166534" }} />
            </div>
            <p className="text-sm font-bold text-gray-900">Almoço</p>
          </div>
          {camposAlmoco.map((campo) => <Campo key={campo.key} campo={campo} />)}
        </div>

        {/* Jantar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
              <Clock size={16} className="text-orange-500" />
            </div>
            <p className="text-sm font-bold text-gray-900">Jantar</p>
          </div>
          {camposJantar.map((campo) => <Campo key={campo.key} campo={campo} />)}
        </div>

        {/* Botão salvar */}
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