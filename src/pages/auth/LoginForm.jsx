import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UtensilsCrossed, User, ChefHat, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";

// Hash simples SHA-256 via Web Crypto API
async function hashSenha(senha) {
  const encoder = new TextEncoder();
  const data = encoder.encode(senha);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const perfil = searchParams.get("perfil") || "estudante";

  const isGestor = perfil === "gestor";
  const cor = isGestor ? "#ea580c" : "#166534";
  const corBorder = isGestor ? "border-orange-200" : "border-green-200";
  const corSpin = isGestor ? "border-orange-500" : "border-green-700";

  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin() {
    setErro("");

    if (!matricula.trim() || !senha.trim()) {
      setErro("Preencha todos os campos.");
      return;
    }

    setLoading(true);

    const hash = await hashSenha(senha);

    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nome, matricula, perfil")
      .eq("matricula", matricula.trim())
      .eq("senha", hash)
      .eq("perfil", perfil)
      .limit(1)
      .single();

    setLoading(false);

    if (error || !data) {
      setErro("Matrícula ou senha incorretos.");
      return;
    }

    // Salva sessão simples no localStorage
    localStorage.setItem(
      "ru_usuario",
      JSON.stringify({
        id: data.id,
        nome: data.nome,
        matricula: data.matricula,
        perfil: data.perfil,
      })
    );

    if (perfil === "estudante") navigate("/inicio");
    else navigate("/painel");
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-6 py-12"
      style={{ backgroundColor: "#f9fafb", colorScheme: "light" }}
    >
      {/* Voltar */}
      <button
        onClick={() => navigate("/")}
        className="self-start flex items-center gap-1 text-sm text-gray-400 active:opacity-70"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <div className="flex flex-col items-center gap-6 w-full">
        {/* Logo */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
          style={{ backgroundColor: cor }}
        >
          {isGestor ? (
            <ChefHat size={28} className="text-white" />
          ) : (
            <User size={28} className="text-white" />
          )}
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>
            {isGestor ? "Acesso do Gestor" : "Acesso do Estudante"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Entre com sua matrícula e senha
          </p>
        </div>

        {/* Formulário */}
        <div className="w-full space-y-3">
          {/* Matrícula */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Matrícula
            </p>
            <input
              type="text"
              placeholder="Ex: 20241234"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              className={`w-full bg-white rounded-2xl px-4 py-3 shadow-sm border-2 outline-none text-gray-900 font-medium ${corBorder} focus:border-current`}
              style={{ borderColor: matricula ? cor : undefined }}
            />
          </div>

          {/* Senha */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Senha
            </p>
            <div
              className={`w-full bg-white rounded-2xl px-4 py-3 shadow-sm border-2 flex items-center gap-2`}
              style={{ borderColor: senha ? cor : "#e5e7eb" }}
            >
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="flex-1 outline-none text-gray-900 font-medium bg-transparent"
              />
              <button
                onClick={() => setMostrarSenha((v) => !v)}
                className="text-gray-400 active:opacity-70"
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              <p className="text-sm text-red-600 font-medium">{erro}</p>
            </div>
          )}

          {/* Botão entrar */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
            style={{ backgroundColor: cor }}
          >
            {loading ? (
              <div
                className={`w-5 h-5 border-2 ${corSpin} border-t-transparent rounded-full animate-spin`}
                style={{ borderColor: "rgba(255,255,255,0.4)", borderTopColor: "white" }}
              />
            ) : (
              "Entrar"
            )}
          </button>

          {/* Link cadastro */}
          <p className="text-sm text-center text-gray-500 pt-1">
            Não tem conta?{" "}
            <button
              onClick={() => navigate(`/cadastro?perfil=${perfil}`)}
              className="font-bold"
              style={{ color: cor }}
            >
              Cadastre-se
            </button>
          </p>
        </div>
      </div>

      {/* Logo rodapé */}
      <div className="flex items-center gap-2 opacity-40">
        <UtensilsCrossed size={14} style={{ color: "#166534" }} />
        <p className="text-xs text-gray-400">NutriRU v1.0.0</p>
      </div>
    </div>
  );
}