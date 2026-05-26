import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import Layout from "../../components/Layout";
import { supabase } from "../../lib/supabase";

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const categoriaConfig = {
  "PRATO PRINCIPAL":    { bg: "bg-orange-50", text: "text-orange-500" },
  "OPÇÃO VEGETARIANA":  { bg: "bg-green-50",  text: "text-green-600" },
  "ACOMPANHAMENTOS":    { bg: "bg-green-50",  text: "text-green-700" },
  "SOBREMESA & SALADA": { bg: "bg-green-50",  text: "text-green-600" },
};

const matricula = "20241234"; // depois vem do localStorage

export default function Inicio() {
  const [turno, setTurno] = useState(() => localStorage.getItem("turno_selecionado") || "almoco");
  const [cardapio, setCardapio] = useState({ almoco: [], jantar: [] });
  const [almoco, setAlmoco] = useState(() => localStorage.getItem("presenca_almoco") === "true");
  const [jantar, setJantar] = useState(() => localStorage.getItem("presenca_jantar") === "true");

  const hoje = new Date();
  const diaSemana = diasSemana[hoje.getDay()];
  const dataFormatada = hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const dataHoje = hoje.toISOString().split("T")[0];

  const horaAtual = hoje.getHours() + hoje.getMinutes() / 60;
  const almocoAberto = horaAtual >= 6 && horaAtual < 10.5;
  const jantarAberto = horaAtual >= 14 && horaAtual < 18.5;

  // Define qual refeição mostrar no banner com base no horário
  const turnoAtivo = horaAtual < 14 ? "almoco" : "jantar";
  const presencaConfirmada = turnoAtivo === "almoco" ? almoco : jantar;
  const janelAberta = turnoAtivo === "almoco" ? almocoAberto : jantarAberto;

  useEffect(() => {
    buscarCardapio();
    buscarPresenca();

    function handleVisibilidade() {
      if (document.visibilityState === "visible") {
        buscarCardapio();
        buscarPresenca();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilidade);
    return () => document.removeEventListener("visibilitychange", handleVisibilidade);
  }, []);

  async function buscarCardapio() {
    const { data, error } = await supabase
      .from("cardapios")
      .select("*")
      .eq("dia", diaSemana)
      .eq("status", "publicado");

    if (error) { console.error(error); return; }

    const almocoItens = [];
    const jantarItens = [];

    data.forEach((item) => {
      const itens = [
        { categoria: "PRATO PRINCIPAL",    nome: item.prato_principal, kcal: item.kcal_principal },
        { categoria: "OPÇÃO VEGETARIANA",  nome: item.vegetariano,     kcal: item.kcal_vegetal },
        { categoria: "ACOMPANHAMENTOS",    nome: item.acompanhamentos, kcal: item.kcal_acomp },
        { categoria: "SOBREMESA & SALADA", nome: `${item.salada} e ${item.sobremesa}`, kcal: item.kcal_salada && item.kcal_sobremesa ? item.kcal_salada + item.kcal_sobremesa : null },
      ];

      if (item.turno === "almoco") almocoItens.push(...itens);
      if (item.turno === "jantar") jantarItens.push(...itens);
    });

    setCardapio({ almoco: almocoItens, jantar: jantarItens });
  }

  async function buscarPresenca() {
    const { data, error } = await supabase
      .from("meal_intentions")
      .select("*")
      .eq("matricula", matricula)
      .eq("data", dataHoje);

    if (error) { console.error(error); return; }

    const almocoConfirmado = !!data?.find(d => d.refeicao === "almoco");
    const jantarConfirmado = !!data?.find(d => d.refeicao === "jantar");

    setAlmoco(almocoConfirmado);
    setJantar(jantarConfirmado);
    localStorage.setItem("presenca_almoco", almocoConfirmado);
    localStorage.setItem("presenca_jantar", jantarConfirmado);
  }

  const itens = cardapio[turno];
  const totalKcal = itens.reduce((acc, item) => acc + (item.kcal || 0), 0);

  return (
    <Layout titulo="NutriRU" ativo="inicio">
      <div className="space-y-4">
        {/* Saudação */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>Olá, Mariana!</h1>
            <p className="text-sm text-gray-500 capitalize">{dataFormatada}</p>
          </div>
          <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full border border-green-200">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            RU Aberto
          </span>
        </div>

        {/* Banner presença */}
        {presencaConfirmada ? (
          <div className="bg-green-700 rounded-2xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={22} className="text-white flex-shrink-0" />
              <div>
                <p className="text-green-200 text-xs">Sua presença de hoje</p>
                <p className="text-white font-bold text-sm">
                  {turnoAtivo === "almoco" ? "Almoço" : "Jantar"} confirmado para hoje!
                </p>
              </div>
            </div>
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {turnoAtivo === "almoco" ? "11:30 - 14h" : "17:30 - 20h"}
            </span>
          </div>
        ) : (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle size={22} className="text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-orange-400 text-xs">Sua presença de hoje</p>
                <p className="text-orange-700 font-bold text-sm">
                  {janelAberta
                    ? `Confirme seu ${turnoAtivo === "almoco" ? "almoço" : "jantar"} de hoje!`
                    : `Confirmações encerradas para o ${turnoAtivo === "almoco" ? "almoço" : "jantar"}`}
                </p>
              </div>
            </div>
            {janelAberta && (
              <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                {turnoAtivo === "almoco" ? "até 10:30" : "até 18:30"}
              </span>
            )}
          </div>
        )}

        {/* Cardápio */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Cardápio do dia</p>
            <div className="flex gap-1 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => { setTurno("almoco"); localStorage.setItem("turno_selecionado", "almoco"); }}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${turno === "almoco" ? "bg-green-700 text-white" : "text-gray-500"}`}
              >
                Almoço
              </button>
              <button
                onClick={() => { setTurno("jantar"); localStorage.setItem("turno_selecionado", "jantar"); }}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${turno === "jantar" ? "bg-green-700 text-white" : "text-gray-500"}`}
              >
                Jantar
              </button>
            </div>
          </div>

          {itens.length > 0 ? (
            <>
              <div className="space-y-2">
                {itens.map((item, i) => {
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
                      {item.kcal && (
                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0">
                          {item.kcal} kcal
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Total de calorias */}
              {totalKcal > 0 && (
                <div className="mt-2 bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-green-700">Total da refeição</p>
                  <span className="bg-green-700 text-white text-sm font-bold px-3 py-1 rounded-xl">
                    {totalKcal} kcal
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl p-8 flex items-center justify-center shadow-sm">
              <p className="text-sm text-gray-400 font-semibold">Nenhum cardápio publicado para hoje</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}