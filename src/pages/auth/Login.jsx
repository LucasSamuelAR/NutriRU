import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, User, ChefHat } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  function entrar(perfil) {
    setLoading(perfil);
    setTimeout(() => {
      if (perfil === "estudante") navigate("/inicio");
      else navigate("/painel");
    }, 800);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12" style={{ backgroundColor: "#f9fafb", colorScheme: "light" }}>

      {/* Logo */}
      <div />
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-sm" style={{ backgroundColor: "#166534" }}>
          <UtensilsCrossed size={36} className="text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold" style={{ color: "#166534" }}>NutriRU</h1>
          <p className="text-sm text-gray-500 mt-1">Gestão inteligente do Restaurante Universitário</p>
        </div>

        {/* Escolha de perfil */}
        <div className="w-full space-y-3 mt-4">
          <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase text-center mb-4">
            Entrar como
          </p>

          <button
            onClick={() => entrar("estudante")}
            disabled={loading !== null}
            className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 border-2 transition-all active:scale-95"
            style={{ borderColor: loading === "estudante" ? "#166534" : "transparent" }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#166534" }}>
              <User size={22} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">Estudante</p>
              <p className="text-xs text-gray-400">Ver cardápio, confirmar presença e avaliar refeições</p>
            </div>
            {loading === "estudante" && (
              <div className="ml-auto w-5 h-5 border-2 border-green-700 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            )}
          </button>

          <button
            onClick={() => entrar("gestor")}
            disabled={loading !== null}
            className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 border-2 transition-all active:scale-95"
            style={{ borderColor: loading === "gestor" ? "#ea580c" : "transparent" }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#ea580c" }}>
              <ChefHat size={22} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">Gestor</p>
              <p className="text-xs text-gray-400">Gerenciar cardápios, produção e relatórios</p>
            </div>
            {loading === "gestor" && (
              <div className="ml-auto w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* Rodapé */}
      <p className="text-xs text-gray-400 text-center">
        NutriRU v1.0.0 — Desenvolvido pela Faculdade PIT
      </p>
    </div>
  );
}