import { Bell, LayoutDashboard, UtensilsCrossed, ClipboardList, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const itens = [
  { key: "painel",   label: "Painel",    Icon: LayoutDashboard, path: "/painel" },
  { key: "cardapio", label: "Cardápio",  Icon: UtensilsCrossed, path: "/cardapio" },
  { key: "producao", label: "Produção",  Icon: ClipboardList,   path: "/producao" },
  { key: "relatorio",label: "Relatório", Icon: BarChart2,        path: "/relatorio" },
];

export default function LayoutGestor({ titulo, ativo, children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-24" style={{ colorScheme: "light" }}>
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#166534" }}>
            <span className="text-white font-bold text-sm">RU</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">{titulo}</p>
            <p className="text-xs font-semibold text-green-700 tracking-wide">ÁREA DO GESTOR</p>
          </div>
        </div>
        <button className="relative p-1">
          <Bell size={22} className="text-gray-600" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-500 rounded-full"></span>
        </button>
      </div>

      {/* Conteúdo */}
      <div className="px-4 pt-5">
        {children}
      </div>

      {/* Menu inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 flex justify-around items-center z-50">
        {itens.map(({ key, label, Icon, path }) => (
          <button
            key={key}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-1 py-1 px-3"
          >
            <Icon
              size={22}
              className={ativo === key ? "text-green-700" : "text-gray-400"}
              strokeWidth={ativo === key ? 2.5 : 1.8}
            />
            <span className={`text-xs font-medium ${ativo === key ? "text-green-700" : "text-gray-400"}`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}