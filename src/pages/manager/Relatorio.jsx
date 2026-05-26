import { useState } from "react";
import { Star, Smile, Thermometer, Eye, Heart, Sun, Moon } from "lucide-react";
import LayoutGestor from "../../components/LayoutGestor";

const dadosSemana = [
  { dia: "Seg", previsto: 500, servido: 482 },
  { dia: "Ter", previsto: 480, servido: 460 },
  { dia: "Qua", previsto: 510, servido: 498 },
  { dia: "Qui", previsto: 490, servido: 475 },
  { dia: "Sex", previsto: 460, servido: 420 },
];

const dadosMes = [
  { dia: "01/10", previsto: 500, servido: 482 },
  { dia: "02/10", previsto: 480, servido: 460 },
  { dia: "03/10", previsto: 510, servido: 498 },
  { dia: "04/10", previsto: 490, servido: 475 },
  { dia: "05/10", previsto: 460, servido: 420 },
  { dia: "06/10", previsto: 500, servido: 490 },
  { dia: "07/10", previsto: 520, servido: 505 },
  { dia: "08/10", previsto: 480, servido: 455 },
  { dia: "09/10", previsto: 510, servido: 498 },
  { dia: "10/10", previsto: 500, servido: 482 },
];

const refeicoesSemana = [
  { data: "Seg, 14/10", turno: "almoco", prato: "Iscas de Carne Acebolada", sabor: 4.5, temperatura: 3.2, aparencia: 4.1, satisfacao: 4.0, avaliacoes: 42 },
  { data: "Seg, 14/10", turno: "jantar", prato: "Frango Grelhado ao Limão", sabor: 4.8, temperatura: 4.5, aparencia: 4.2, satisfacao: 4.6, avaliacoes: 28 },
  { data: "Ter, 15/10", turno: "almoco", prato: "Carne Assada com Molho", sabor: 3.8, temperatura: 2.8, aparencia: 3.5, satisfacao: 3.6, avaliacoes: 38 },
  { data: "Ter, 15/10", turno: "jantar", prato: "Peixe Grelhado", sabor: 4.2, temperatura: 4.0, aparencia: 3.9, satisfacao: 4.1, avaliacoes: 21 },
  { data: "Qua, 16/10", turno: "almoco", prato: "Frango à Parmegiana", sabor: 4.9, temperatura: 4.7, aparencia: 4.8, satisfacao: 4.9, avaliacoes: 55 },
  { data: "Qui, 17/10", turno: "almoco", prato: "Bisteca Suína", sabor: 3.5, temperatura: 3.0, aparencia: 3.8, satisfacao: 3.4, avaliacoes: 33 },
  { data: "Sex, 18/10", turno: "almoco", prato: "Peixe ao Molho", sabor: 4.0, temperatura: 3.8, aparencia: 4.0, satisfacao: 3.9, avaliacoes: 29 },
];

const refeicoesMes = [
  ...refeicoesSemana,
  { data: "Seg, 07/10", turno: "almoco", prato: "Frango Grelhado", sabor: 4.3, temperatura: 4.0, aparencia: 4.1, satisfacao: 4.2, avaliacoes: 40 },
  { data: "Ter, 08/10", turno: "almoco", prato: "Carne de Panela", sabor: 4.7, temperatura: 4.5, aparencia: 4.3, satisfacao: 4.6, avaliacoes: 45 },
  { data: "Qua, 09/10", turno: "jantar", prato: "Omelete de Legumes", sabor: 3.9, temperatura: 3.5, aparencia: 3.8, satisfacao: 3.7, avaliacoes: 18 },
];

function notaMedia(r) {
  return ((r.sabor + r.temperatura + r.aparencia + r.satisfacao) / 4).toFixed(1);
}

function corNota(nota) {
  if (nota >= 4.5) return "#166534";
  if (nota >= 3.5) return "#ea580c";
  return "#dc2626";
}

export default function Relatorio() {
  const [periodo, setPeriodo] = useState("semana");

  const dados = periodo === "semana" ? dadosSemana : dadosMes;
  const refeicoes = periodo === "semana" ? refeicoesSemana : refeicoesMes;
  const maxValor = Math.max(...dados.map((d) => d.previsto));

  const totalIntencoes = refeicoes.reduce((acc, r) => acc + r.avaliacoes * 10, 0);
  const totalServido = dados.reduce((acc, d) => acc + d.servido, 0);
  const totalDescarte = (refeicoes.length * 1.4).toFixed(1);

  return (
    <LayoutGestor titulo="Relatório Geral" ativo="relatorio">
      <div className="space-y-5 pb-4">

        {/* Título e seletor */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>Métricas e Resultados</h1>
            <p className="text-sm text-gray-500 mt-1">Acompanhamento de desperdício e satisfação</p>
          </div>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="text-sm font-semibold text-gray-900 bg-white border border-gray-200 rounded-2xl px-3 py-2 outline-none"
          >
            <option value="semana">Semana</option>
            <option value="mes">Mês</option>
          </select>
        </div>

        {/* Gráfico previsto vs servido */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-1">Previsto vs Servido</p>
          <p className="text-xs text-gray-400 mb-4">Comparativo diário de refeições</p>
          <div className="flex items-end justify-around gap-1 h-32 overflow-x-auto">
            {dados.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0" style={{ minWidth: periodo === "mes" ? "28px" : undefined }}>
                <div className="flex items-end gap-0.5 justify-center" style={{ height: "100px" }}>
                  <div className="rounded-t-lg bg-gray-200 w-3" style={{ height: `${(d.previsto / maxValor) * 100}px` }} />
                  <div className="rounded-t-lg w-3" style={{ height: `${(d.servido / maxValor) * 100}px`, backgroundColor: "#166534" }} />
                </div>
                <p className="text-xs text-gray-400">{d.dia}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-200" />
              <span className="text-xs text-gray-400">Previsto</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#166534" }} />
              <span className="text-xs text-gray-400">Servido</span>
            </div>
          </div>
        </div>

        {/* Avaliações por refeição */}
        <div>
          <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-3">
            Satisfação por Refeição
          </p>
          <div className="space-y-3">
            {refeicoes.map((r, i) => {
              const media = notaMedia(r);
              return (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${r.turno === "almoco" ? "bg-green-50" : "bg-orange-50"}`}>
                        {r.turno === "almoco"
                          ? <Sun size={14} className="text-green-600" />
                          : <Moon size={14} className="text-orange-500" />
                        }
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{r.data} — {r.turno === "almoco" ? "Almoço" : "Jantar"}</p>
                        <p className="text-sm font-semibold text-gray-900">{r.prato}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-lg font-bold" style={{ color: corNota(Number(media)) }}>{media}</p>
                      <Star size={14} className="text-orange-400" fill="#fb923c" />
                    </div>
                  </div>

                  {/* Critérios */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Sabor", valor: r.sabor, Icon: Smile },
                      { label: "Temperatura", valor: r.temperatura, Icon: Thermometer },
                      { label: "Aparência", valor: r.aparencia, Icon: Eye },
                      { label: "Satisfação", valor: r.satisfacao, Icon: Heart },
                    ].map(({ label, valor, Icon }) => (
                      <div key={label} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <Icon size={12} className="text-gray-300" />
                          <p className="text-xs text-gray-400">{label}</p>
                        </div>
                        <p className="text-xs font-bold" style={{ color: corNota(valor) }}>{valor}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-400 mt-2">{r.avaliacoes} avaliações recebidas</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumo consolidado */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-3">Resumo Consolidado</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total de Intenções</p>
              <p className="text-sm font-bold text-gray-900">{totalIntencoes.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total Servido</p>
              <p className="text-sm font-bold" style={{ color: "#166534" }}>{totalServido.toLocaleString()} refeições</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total de Descarte</p>
              <p className="text-sm font-bold text-orange-500">{totalDescarte} kg</p>
            </div>
          </div>
        </div>

      </div>
    </LayoutGestor>
  );
}