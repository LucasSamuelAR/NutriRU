import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Copy, CheckCircle, Clock, Beef, Leaf, UtensilsCrossed, Salad, Apple, X, Save } from "lucide-react";
import LayoutGestor from "../../components/LayoutGestor";
import { supabase } from "../../lib/supabase";

const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const formVazio = { pratoPrincipal: "", vegetariano: "", acompanhamentos: "", salada: "", sobremesa: "", calorias: "", proteinas: "", carboidratos: "", gorduras: "" };

export default function Cardapio() {
  const [diaSelecionado, setDiaSelecionado] = useState("Seg");
  const [turno, setTurno] = useState("almoco");
  const [cardapios, setCardapios] = useState({});
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(formVazio);

  const chave = `${diaSelecionado}-${turno}`;
  const cardapio = cardapios[chave];

  useEffect(() => {
    buscarCardapios();
  }, []);

  async function buscarCardapios() {
    const { data, error } = await supabase.from("cardapios").select("*");
    if (error) { console.error(error); return; }

    const mapa = {};
    data.forEach((item) => {
      mapa[`${item.dia}-${item.turno}`] = {
        id: item.id,
        status: item.status,
        pratoPrincipal: item.prato_principal,
        vegetariano: item.vegetariano,
        acompanhamentos: item.acompanhamentos,
        salada: item.salada,
        sobremesa: item.sobremesa,
        calorias: item.calorias,
        proteinas: item.proteinas,
        carboidratos: item.carboidratos,
        gorduras: item.gorduras,
      };
    });
    setCardapios(mapa);
  }

  function getStatus(dia) {
    const almoco = cardapios[`${dia}-almoco`];
    const jantar = cardapios[`${dia}-jantar`];
    if (!almoco && !jantar) return null;
    if (almoco?.status === "publicado" || jantar?.status === "publicado") return "publicado";
    return "rascunho";
  }

  function mostrarToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handlePublicar() {
    const { error } = await supabase
      .from("cardapios")
      .update({ status: "publicado" })
      .eq("id", cardapio.id);
    if (error) { console.error(error); return; }
    setCardapios((prev) => ({ ...prev, [chave]: { ...prev[chave], status: "publicado" } }));
    mostrarToast("Cardápio publicado! Notificação enviada para os estudantes.");
  }

  async function handleDuplicar() {
    mostrarToast("Cardápio duplicado como rascunho para a próxima semana.");
  }

  async function handleExcluir() {
    const { error } = await supabase.from("cardapios").delete().eq("id", cardapio.id);
    if (error) { console.error(error); return; }
    setCardapios((prev) => { const novo = { ...prev }; delete novo[chave]; return novo; });
    mostrarToast("Cardápio excluído.");
  }

  function abrirNovo() {
    setForm(formVazio);
    setModal(true);
  }

  function abrirEditar() {
    setForm({
      pratoPrincipal: cardapio.pratoPrincipal,
      vegetariano: cardapio.vegetariano,
      acompanhamentos: cardapio.acompanhamentos,
      salada: cardapio.salada,
      sobremesa: cardapio.sobremesa,
      calorias: cardapio.calorias?.toString(),
      proteinas: cardapio.proteinas?.toString(),
      carboidratos: cardapio.carboidratos?.toString(),
      gorduras: cardapio.gorduras?.toString(),
    });
    setModal(true);
  }

  async function handleSalvar() {
    if (cardapio?.id) {
      // Editar
      const { error } = await supabase
        .from("cardapios")
        .update({
          prato_principal: form.pratoPrincipal,
          vegetariano: form.vegetariano,
          acompanhamentos: form.acompanhamentos,
          salada: form.salada,
          sobremesa: form.sobremesa,
          calorias: Number(form.calorias),
          proteinas: Number(form.proteinas),
          carboidratos: Number(form.carboidratos),
          gorduras: Number(form.gorduras),
        })
        .eq("id", cardapio.id);
      if (error) { console.error(error); return; }
    } else {
      // Novo
      const { error } = await supabase.from("cardapios").insert({
        dia: diaSelecionado,
        turno,
        status: "rascunho",
        prato_principal: form.pratoPrincipal,
        vegetariano: form.vegetariano,
        acompanhamentos: form.acompanhamentos,
        salada: form.salada,
        sobremesa: form.sobremesa,
        calorias: Number(form.calorias),
        proteinas: Number(form.proteinas),
        carboidratos: Number(form.carboidratos),
        gorduras: Number(form.gorduras),
      });
      if (error) { console.error(error); return; }
    }

    await buscarCardapios();
    setModal(false);
    mostrarToast("Cardápio salvo como rascunho!");
  }

  return (
    <LayoutGestor titulo="Cardápios" ativo="cardapio">
      <div className="space-y-4 pb-4">

        {/* Toast */}
        {toast && (
          <div className="fixed top-4 left-4 right-4 z-50 px-4 py-3 rounded-2xl text-white text-sm font-semibold shadow-lg flex items-center gap-2" style={{ backgroundColor: "#166534" }}>
            <CheckCircle size={16} />
            {toast}
          </div>
        )}

        {/* Modal */}
        {modal && (
          <div className="fixed inset-0 z-40 flex items-end" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
            <div className="bg-white w-full rounded-t-3xl p-5 max-h-[90vh] overflow-y-auto pb-8">
              <div className="flex items-center justify-between mb-5">
                <p className="text-lg font-bold text-gray-900">
                  {cardapio ? "Editar Cardápio" : "Novo Cardápio"}
                </p>
                <button onClick={() => setModal(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { key: "pratoPrincipal", label: "Prato Principal", placeholder: "Ex: Iscas de Carne Acebolada" },
                  { key: "vegetariano", label: "Opção Vegetariana", placeholder: "Ex: Estrogonofe de Grão de Bico" },
                  { key: "acompanhamentos", label: "Acompanhamentos", placeholder: "Ex: Arroz, Feijão, Purê" },
                  { key: "salada", label: "Salada", placeholder: "Ex: Mix de Folhas Verdes" },
                  { key: "sobremesa", label: "Sobremesa", placeholder: "Ex: Laranja Fresca" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">{label}</p>
                    <input
                      type="text"
                      value={form[key]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm text-gray-900 outline-none border border-transparent focus:border-green-200"
                    />
                  </div>
                ))}

                {/* Valores nutricionais */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Valores Nutricionais</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "calorias", label: "Calorias (kcal)" },
                      { key: "proteinas", label: "Proteínas (g)" },
                      { key: "carboidratos", label: "Carboidratos (g)" },
                      { key: "gorduras", label: "Gorduras (g)" },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <p className="text-xs text-gray-400 mb-1">{label}</p>
                        <input
                          type="number"
                          value={form[key]}
                          onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                          placeholder="0"
                          className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm text-gray-900 outline-none border border-transparent focus:border-green-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSalvar}
                  className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#166534" }}
                >
                  <Save size={18} />
                  Salvar Cardápio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Título e botão novo */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>Cardápios</h1>
            <p className="text-sm text-gray-500 mt-0.5">{new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p>
          </div>
          <button
            onClick={abrirNovo}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-sm font-semibold"
            style={{ backgroundColor: "#ea580c" }}
          >
            <Plus size={16} />
            Novo
          </button>
        </div>

        {/* Abas dos dias */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {dias.map((dia) => {
            const status = getStatus(dia);
            const ativo = diaSelecionado === dia;
            return (
              <button key={dia} onClick={() => setDiaSelecionado(dia)} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all ${ativo ? "text-white" : "bg-gray-100 text-gray-500"}`}
                  style={ativo ? { backgroundColor: "#166534" } : {}}
                >
                  <span className="text-xs font-semibold">{dia}</span>
                  {status && (
                    <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${status === "publicado" ? "bg-green-400" : "bg-orange-400"}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Toggle turno */}
        <div className="bg-gray-100 rounded-2xl p-1 flex">
          <button onClick={() => setTurno("almoco")} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${turno === "almoco" ? "bg-white text-green-700 shadow-sm" : "text-gray-400"}`}>
            ☀️ Almoço
          </button>
          <button onClick={() => setTurno("jantar")} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${turno === "jantar" ? "bg-white text-green-700 shadow-sm" : "text-gray-400"}`}>
            🌙 Jantar
          </button>
        </div>

        {/* Card do cardápio */}
        {cardapio ? (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className={`px-4 py-2 flex items-center justify-between ${cardapio.status === "publicado" ? "bg-green-700" : "bg-gray-100"}`}>
              <div className="flex items-center gap-2">
                {cardapio.status === "publicado" ? <CheckCircle size={14} className="text-white" /> : <Clock size={14} className="text-gray-400" />}
                <span className={`text-xs font-semibold ${cardapio.status === "publicado" ? "text-white" : "text-gray-400"}`}>
                  {cardapio.status === "publicado" ? "Publicado" : "Rascunho"}
                </span>
              </div>
              {cardapio.status === "rascunho" && (
                <button onClick={handlePublicar} className="text-xs font-semibold text-green-700 bg-white px-3 py-1 rounded-full">
                  Publicar
                </button>
              )}
            </div>

            <div className="p-4 space-y-3">
              {[
                { icon: <Beef size={15} className="text-orange-500" />, bg: "bg-orange-50", label: "Prato Principal", valor: cardapio.pratoPrincipal },
                { icon: <Leaf size={15} className="text-green-600" />, bg: "bg-green-50", label: "Opção Vegetariana", valor: cardapio.vegetariano },
                { icon: <UtensilsCrossed size={15} className="text-green-700" />, bg: "bg-green-50", label: "Acompanhamentos", valor: cardapio.acompanhamentos },
              ].map(({ icon, bg, label, valor }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>{icon}</div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-semibold text-gray-900">{valor}</p>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0"><Salad size={15} className="text-green-600" /></div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Salada</p>
                    <p className="text-sm font-semibold text-gray-900">{cardapio.salada}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0"><Apple size={15} className="text-orange-400" /></div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Sobremesa</p>
                    <p className="text-sm font-semibold text-gray-900">{cardapio.sobremesa}</p>
                  </div>
                </div>
              </div>

              {/* Valores nutricionais */}
              {cardapio.calorias && (
                <div className="bg-gray-50 rounded-2xl p-3 mt-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Valores Nutricionais</p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: "Kcal", valor: cardapio.calorias },
                      { label: "Prot", valor: `${cardapio.proteinas}g` },
                      { label: "Carb", valor: `${cardapio.carboidratos}g` },
                      { label: "Gord", valor: `${cardapio.gorduras}g` },
                    ].map(({ label, valor }) => (
                      <div key={label}>
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-sm font-bold text-gray-900">{valor}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 pb-4 flex gap-2">
              <button onClick={abrirEditar} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-gray-500 text-sm font-semibold">
                <Pencil size={14} />
                Editar
              </button>
              <button onClick={handleDuplicar} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50 text-green-700 text-sm font-semibold">
                <Copy size={14} />
                Duplicar
              </button>
              <button onClick={handleExcluir} className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
              <UtensilsCrossed size={20} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-400">Nenhum cardápio para este turno</p>
            <button onClick={abrirNovo} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-sm font-semibold" style={{ backgroundColor: "#ea580c" }}>
              <Plus size={16} />
              Cadastrar agora
            </button>
          </div>
        )}
      </div>
    </LayoutGestor>
  );
}