import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UtensilsCrossed, User, ChefHat, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

async function hashSenha(senha) {
  const encoder = new TextEncoder();
  const data = encoder.encode(senha);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function Cadastro() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const perfil = searchParams.get("perfil") || "estudante";

  const isGestor = perfil === "gestor";
  const cor = isGestor ? "#ea580c" : "#166534";

  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleCadastro() {
    setErro("");

    if (!nome.trim() || !matricula.trim() || !senha.trim() || !confirmarSenha.trim()) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (!/^\d{6,12}$/.test(matricula.trim())) {
      setErro("A matrícula deve conter entre 6 e 12 números.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    // Verifica se matrícula já existe
    const { data: existente } = await supabase
      .from("usuarios")
      .select("id")
      .eq("matricula", matricula.trim())
      .limit(1)
      .single();

    if (existente) {
      setErro("Essa matrícula já está cadastrada.");
      setLoading(false);
      return;
    }

    const hash = await hashSenha(senha);

    const { data, error } = await supabase
      .from("usuarios")
      .insert([
        {
          nome: nome.trim(),
          matricula: matricula.trim(),
          senha: hash,
          perfil,
        },
      ])
      .select("id, nome, matricula, perfil")
      .single();

    setLoading(false);

    if (error || !data) {
      setErro("Erro ao criar conta. Tente novamente.");
      return;
    }

    // Salva sessão e redireciona
    localStorage.setItem(
      "ru_usuario",
      JSON.stringify({
        id: data.id,
        nome: data.nome,
        matricula: data.matricula,
        perfil: data.perfil,
      })
    );

    setSucesso(true);

    setTimeout(() => {
      if (perfil === "estudante") navigate("/inicio");
      else navigate("/painel");
    }, 1500);
  }

  // Tela de sucesso
  if (sucesso) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 gap-5"
        style={{ backgroundColor: "#f9fafb" }}
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-sm"
          style={{ backgroundColor: cor }}
        >
          <CheckCircle2 size={40} className="text-white" />
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">Cadastro realizado!</p>
          <p className="text-sm text-gray-500 mt-1">Redirecionando...</p>
        </div>
        <div
          className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${cor}40`, borderTopColor: cor }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-6 py-12"
      style={{ backgroundColor: "#f9fafb", colorScheme: "light" }}
    >
      {/* Voltar */}
      <button
        onClick={() => navigate(`/login-form?perfil=${perfil}`)}
        className="self-start flex items-center gap-1 text-sm text-gray-400 active:opacity-70"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <div className="flex flex-col items-center gap-6 w-full">
        {/* Ícone */}
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
          <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>Criar conta</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isGestor ? "Acesso de gestor" : "Acesso de estudante"}
          </p>
        </div>

        {/* Formulário */}
        <div className="w-full space-y-3">

          {/* Nome */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Primeiro Nome
            </p>
            <input
              type="text"
              placeholder="Ex: Mariana"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-white rounded-2xl px-4 py-3 shadow-sm border-2 outline-none text-gray-900 font-medium"
              style={{ borderColor: nome ? cor : "#e5e7eb" }}
            />
          </div>

          {/* Matrícula */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Matrícula
            </p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Somente números (ex: 20241234)"
              value={matricula}
              onChange={(e) => {
                const apenasNumeros = e.target.value.replace(/\D/g, "").slice(0, 12);
                setMatricula(apenasNumeros);
              }}
              className="w-full bg-white rounded-2xl px-4 py-3 shadow-sm border-2 outline-none text-gray-900 font-medium"
              style={{
                borderColor: matricula
                  ? matricula.length >= 6
                    ? cor
                    : "#ef4444"
                  : "#e5e7eb",
              }}
            />
            {matricula.length > 0 && matricula.length < 6 && (
              <p className="text-xs text-red-500 mt-1 ml-1">
                Mínimo 6 dígitos ({matricula.length}/6)
              </p>
            )}
          </div>

          {/* Senha */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Senha
            </p>
            <div
              className="w-full bg-white rounded-2xl px-4 py-3 shadow-sm border-2 flex items-center gap-2"
              style={{ borderColor: senha ? cor : "#e5e7eb" }}
            >
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
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

          {/* Confirmar senha */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Confirmar Senha
            </p>
            <div
              className="w-full bg-white rounded-2xl px-4 py-3 shadow-sm border-2 flex items-center gap-2"
              style={{
                borderColor:
                  confirmarSenha
                    ? confirmarSenha === senha
                      ? cor
                      : "#ef4444"
                    : "#e5e7eb",
              }}
            >
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Repita a senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCadastro()}
                className="flex-1 outline-none text-gray-900 font-medium bg-transparent"
              />
              {confirmarSenha && confirmarSenha === senha && (
                <CheckCircle2 size={18} style={{ color: cor }} />
              )}
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              <p className="text-sm text-red-600 font-medium">{erro}</p>
            </div>
          )}

          {/* Botão */}
          <button
            onClick={handleCadastro}
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
            style={{ backgroundColor: cor }}
          >
            {loading ? (
              <div
                className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "rgba(255,255,255,0.4)", borderTopColor: "white" }}
              />
            ) : (
              "Criar conta"
            )}
          </button>

          {/* Link login */}
          <p className="text-sm text-center text-gray-500 pt-1">
            Já tem conta?{" "}
            <button
              onClick={() => navigate(`/login-form?perfil=${perfil}`)}
              className="font-bold"
              style={{ color: cor }}
            >
              Entrar
            </button>
          </p>
        </div>
      </div>

      {/* Rodapé */}
      <div className="flex items-center gap-2 opacity-40">
        <UtensilsCrossed size={14} style={{ color: "#166534" }} />
        <p className="text-xs text-gray-400">NutriRU v1.0.0</p>
      </div>
    </div>
  );
}