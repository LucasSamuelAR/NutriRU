import { useState, useEffect } from "react";
import { Star, Smile, Thermometer, Droplets, Heart, Sun, Moon, TrendingUp, TrendingDown } from "lucide-react";
import LayoutGestor from "../../components/LayoutGestor";
import { supabase } from "../../lib/supabase";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const PRATO_LABELS = {
  prato_principal: "Prato Principal",
  vegetariano:     "Opção Vegetariana",
  acompanhamentos: "Acompanhamentos",
  salada:          "Salada",
  sobremesa:       "Sobremesa",
};

function corNota(n) {
  if (n >= 4.5) return "#166534";
  if (n >= 3.5) return "#ea580c";
  return "#dc2626";
}

function avg(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function intervalo(periodo) {
  const hoje = new Date();
  const fim = hoje.toISOString().split("T")[0];
  if (periodo === "dia") return { inicio: fim, fim };
  if (periodo === "semana") {
    const ini = new Date(hoje); ini.setDate(hoje.getDate() - 6);
    return { inicio: ini.toISOString().split("T")[0], fim };
  }
  const ini = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  return { inicio: ini.toISOString().split("T")[0], fim };
}

function fmtLabel(dateStr, periodo) {
  const d = new Date(dateStr + "T00:00:00");
  return periodo === "mes"
    ? d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    : DIAS_SEMANA[d.getDay()];
}

export default function Relatorio() {
  const [periodo,   setPeriodo]   = useState("semana");
  const [loading,   setLoading]   = useState(true);
  const [producao,  setProducao]  = useState([]);
  const [refeicoes, setRefeicoes] = useState([]); // um item por cardapio, com pratos[]

  useEffect(() => { fetchDados(); }, [periodo]);

  async function fetchDados() {
    setLoading(true);
    const { inicio, fim } = intervalo(periodo);

    const { data: prodData } = await supabase
      .from("production_records")
      .select("*")
      .gte("data", inicio)
      .lte("data", fim)
      .order("data", { ascending: true });

    const { data: avalData } = await supabase
      .from("avaliacoes")
      .select("cardapio_id, prato, nota_sabor, nota_temperatura, nota_saciedade, nota_satisfacao, data")
      .gte("data", inicio)
      .lte("data", fim);

    if (!avalData || avalData.length === 0) {
      setProducao(prodData || []);
      setRefeicoes([]);
      setLoading(false);
      return;
    }

    const ids = [...new Set(avalData.map((a) => a.cardapio_id))];
    const { data: cardData } = await supabase
      .from("cardapios")
      .select("id, dia, turno, prato_principal, vegetariano, acompanhamentos, salada, sobremesa")
      .in("id", ids);

    // Agrupa por cardapio_id + prato
    const grupos = {};
    avalData.forEach((a) => {
      const key = `${a.cardapio_id}__${a.prato}`;
      if (!grupos[key]) {
        grupos[key] = {
          cardapio_id: a.cardapio_id,
          prato: a.prato,
          data: a.data,
          sabor: [], temperatura: [], saciedade: [], satisfacao: [], total: 0,
        };
      }
      grupos[key].sabor.push(a.nota_sabor);
      grupos[key].temperatura.push(a.nota_temperatura);
      grupos[key].saciedade.push(a.nota_saciedade);
      grupos[key].satisfacao.push(a.nota_satisfacao);
      grupos[key].total++;
    });

    // Agrupa os pratos dentro de cada cardápio
    const porCardapio = {};
    Object.values(grupos).forEach((g) => {
      if (!porCardapio[g.cardapio_id]) porCardapio[g.cardapio_id] = [];
      const sabor       = avg(g.sabor);
      const temperatura = avg(g.temperatura);
      const saciedade   = avg(g.saciedade);
      const satisfacao  = avg(g.satisfacao);
      const media       = (sabor + temperatura + saciedade + satisfacao) / 4;
      porCardapio[g.cardapio_id].push({
        prato: g.prato,
        pratoLabel: PRATO_LABELS[g.prato] || g.prato,
        sabor, temperatura, saciedade, satisfacao, media,
        avaliacoes: g.total,
        data: g.data,
      });
    });

    // Monta lista final: um item por cardápio com seus pratos avaliados
    const lista = (cardData || []).map((c) => ({
      ...c,
      nomePrato: c.prato_principal || "—",
      pratos: (porCardapio[c.id] || []).sort((a, b) =>
        Object.keys(PRATO_LABELS).indexOf(a.prato) - Object.keys(PRATO_LABELS).indexOf(b.prato)
      ),
    })).sort((a, b) => {
      const dataA = porCardapio[a.id]?.[0]?.data || "";
      const dataB = porCardapio[b.id]?.[0]?.data || "";
      return new Date(dataA) - new Date(dataB);
    });

    setProducao(prodData || []);
    setRefeicoes(lista);
    setLoading(false);
  }

  const graficoDados = producao.map((r) => ({
    label: periodo === "dia"
      ? (r.turno === "almoco" ? "Almoço" : "Jantar")
      : fmtLabel(r.data, periodo),
    previstas: r.previstas || 0,
    servidas:  r.servidas  || 0,
  }));
  const maxGrafico = Math.max(...graficoDados.map((d) => d.previstas), 1);

  const totalPrevistas = producao.reduce((a, r) => a + (r.previstas || 0), 0);
  const totalServidas  = producao.reduce((a, r) => a + (r.servidas  || 0), 0);
  const totalSobras    = producao.reduce((a, r) => a + (r.sobras    || 0), 0).toFixed(1);
  const totalDescarte  = producao.reduce((a, r) => a + (r.descarte  || 0), 0).toFixed(1);
  const taxaAprov      = totalPrevistas > 0 ? ((totalServidas / totalPrevistas) * 100).toFixed(1) : "—";

  // Destaques por prato individual
  const todosPratos = refeicoes.flatMap((r) => r.pratos);
  const melhor = todosPratos.length ? todosPratos.reduce((b, p) => p.media > b.media ? p : b) : null;
  const pior   = todosPratos.length ? todosPratos.reduce((b, p) => p.media < b.media ? p : b) : null;

  return (
    <LayoutGestor titulo="Relatório Geral" ativo="relatorio">
      <div className="space-y-5 pb-4">

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>Métricas e Resultados</h1>
            <p className="text-sm text-gray-500 mt-1">Desperdício, produção e satisfação</p>
          </div>
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}
            className="text-sm font-semibold text-gray-900 bg-white border border-gray-200 rounded-2xl px-3 py-2 outline-none">
            <option value="dia">Hoje</option>
            <option value="semana">Semana</option>
            <option value="mes">Mês</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400">Carregando...</div>
        ) : (
          <>
            {/* Cards resumo produção */}
            {producao.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Previstas",     valor: totalPrevistas.toLocaleString(), cor: "text-gray-900" },
                  { label: "Servidas",       valor: totalServidas.toLocaleString(),  cor: "#166534" },
                  { label: "Sobras",         valor: `${totalSobras} kg`,             cor: "#ea580c" },
                  { label: "Aproveitamento", valor: `${taxaAprov}%`,                 cor: Number(taxaAprov) >= 90 ? "#166534" : "#ea580c" },
                ].map(({ label, valor, cor }) => (
                  <div key={label} className="bg-white rounded-2xl p-4 shadow-sm">
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <p className="text-xl font-bold" style={{ color: cor }}>{valor}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Destaques melhor / pior prato */}
            {melhor && pior && melhor.prato !== pior.prato && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 border border-green-100 rounded-2xl p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp size={13} style={{ color: "#166534" }} />
                    <p className="text-xs font-semibold" style={{ color: "#166534" }}>Melhor avaliado</p>
                  </div>
                  <p className="text-xs text-gray-400">{melhor.pratoLabel}</p>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{melhor.media.toFixed(1)} ★</p>
                  <p className="text-xs text-gray-400 mt-0.5">{melhor.avaliacoes} avaliações</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingDown size={13} className="text-orange-500" />
                    <p className="text-xs font-semibold text-orange-600">Pior avaliado</p>
                  </div>
                  <p className="text-xs text-gray-400">{pior.pratoLabel}</p>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{pior.media.toFixed(1)} ★</p>
                  <p className="text-xs text-gray-400 mt-0.5">{pior.avaliacoes} avaliações</p>
                </div>
              </div>
            )}

            {/* Gráfico previsto vs servido */}
            {graficoDados.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-1">Previsto vs Servido</p>
                <p className="text-xs text-gray-400 mb-4">Refeições por {periodo === "dia" ? "turno" : "dia"}</p>
                <div className="flex items-end justify-around gap-1 h-32 overflow-x-auto">
                  {graficoDados.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0" style={{ minWidth: periodo === "mes" ? "28px" : undefined }}>
                      <div className="flex items-end gap-0.5 justify-center" style={{ height: "100px" }}>
                        <div className="rounded-t-lg bg-gray-200 w-3" style={{ height: `${(d.previstas / maxGrafico) * 100}px` }} />
                        <div className="rounded-t-lg w-3" style={{ height: `${(d.servidas / maxGrafico) * 100}px`, backgroundColor: "#166534" }} />
                      </div>
                      <p className="text-xs text-gray-400 text-center leading-tight" style={{ maxWidth: 36 }}>{d.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-200" /><span className="text-xs text-gray-400">Previsto</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#166534" }} /><span className="text-xs text-gray-400">Servido</span></div>
                </div>
              </div>
            )}

            {/* Avaliações por refeição — agrupadas por cardápio, detalhadas por prato */}
            {refeicoes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-3">Satisfação por Refeição</p>
                <div className="space-y-3">
                  {refeicoes.map((r) => (
                    <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm">

                      {/* Cabeçalho do cardápio */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${r.turno === "almoco" ? "bg-green-50" : "bg-orange-50"}`}>
                          {r.turno === "almoco" ? <Sun size={14} className="text-green-600" /> : <Moon size={14} className="text-orange-500" />}
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">{r.dia} — {r.turno === "almoco" ? "Almoço" : "Jantar"}</p>
                          <p className="text-sm font-semibold text-gray-900">{r.nomePrato}</p>
                        </div>
                      </div>

                      {/* Um bloco por prato avaliado */}
                      <div className="space-y-3">
                        {r.pratos.map((p) => (
                          <div key={p.prato} className="border border-gray-100 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{p.pratoLabel}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{r[p.prato] || ""}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <p className="text-base font-bold" style={{ color: corNota(p.media) }}>{p.media.toFixed(1)}</p>
                                <Star size={12} className="text-orange-400" fill="#fb923c" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              {[
                                { label: "Sabor",       valor: p.sabor,       Icon: Smile },
                                { label: "Temperatura", valor: p.temperatura, Icon: Thermometer },
                                { label: "Saciedade",   valor: p.saciedade,   Icon: Droplets },
                                { label: "Satisfação",  valor: p.satisfacao,  Icon: Heart },
                              ].map(({ label, valor, Icon }) => (
                                <div key={label} className="flex items-center justify-between bg-gray-50 rounded-lg px-2 py-1.5">
                                  <div className="flex items-center gap-1">
                                    <Icon size={11} className="text-gray-300" />
                                    <p className="text-xs text-gray-400">{label}</p>
                                  </div>
                                  <p className="text-xs font-bold" style={{ color: corNota(valor) }}>{valor.toFixed(1)}</p>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5">{p.avaliacoes} avaliações</p>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumo consolidado */}
            {producao.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-3">Resumo Consolidado</p>
                <div className="space-y-3">
                  {[
                    { label: "Total de Intenções", valor: totalPrevistas.toLocaleString(),                cor: "text-gray-900" },
                    { label: "Total Servido",       valor: `${totalServidas.toLocaleString()} refeições`, cor: "#166534" },
                    { label: "Total de Sobras",     valor: `${totalSobras} kg`,                           cor: "#ea580c" },
                    { label: "Total de Descarte",   valor: `${totalDescarte} kg`,                         cor: "#dc2626" },
                  ].map(({ label, valor, cor }) => (
                    <div key={label} className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">{label}</p>
                      <p className="text-sm font-bold" style={{ color: cor }}>{valor}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {producao.length === 0 && refeicoes.length === 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                <p className="text-sm font-semibold text-gray-400">Nenhum dado disponível para este período.</p>
              </div>
            )}
          </>
        )}
      </div>
    </LayoutGestor>
  );
}