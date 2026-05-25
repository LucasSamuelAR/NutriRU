import { User } from "lucide-react";
import Layout from "../../components/Layout";

export default function Perfil() {
  return (
    <Layout titulo="Meu Perfil" ativo="perfil">
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-4 border-green-700">
              <User size={36} className="text-gray-400" />
            </div>
            <span className="absolute bottom-0 right-0 w-5 h-5 bg-green-600 rounded-full border-2 border-white"></span>
          </div>
          <p className="text-lg font-bold text-gray-900">Mariana Silveira</p>
          <p className="text-sm text-gray-500">mariana.silveira@ufrj.br</p>
          <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-4 py-1.5 rounded-full">
            Estudante Ativo
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-xs text-gray-500 mb-1">Presenças este mês</p>
            <p className="text-2xl font-bold" style={{ color: "#166534" }}>18</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-xs text-gray-500 mb-1">Avaliações feitas</p>
            <p className="text-2xl font-bold text-orange-500">14</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-3">Informações Acadêmicas</p>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {[
              { label: "DRE / Matrícula", valor: "120045892" },
              { label: "Curso", valor: "Engenharia de Produção" },
              { label: "Vínculo", valor: "Isenção Integral (RU)" },
            ].map((item, i, arr) => (
              <div key={i} className={`flex items-center justify-between px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-sm font-bold text-gray-900">{item.valor}</p>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full py-4 rounded-2xl bg-red-50 text-red-500 font-bold text-base">
          Sair da Conta
        </button>

        <p className="text-center text-xs text-gray-400 pb-2">
          NutriRU v1.0.0 — Desenvolvido pela Faculdade PIT
        </p>
      </div>
    </Layout>
  );
}