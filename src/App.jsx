import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Inicio from "./pages/student/Inicio";
import Intencao from "./pages/student/Intencao";
import Avaliacao from "./pages/student/Avaliacao";
import Perfil from "./pages/student/Perfil";
import Painel from "./pages/manager/Painel";
import Cardapio from "./pages/manager/Cardapio";
import Producao from "./pages/manager/Producao";
import Relatorio from "./pages/manager/Relatorio";
import Configuracoes from "./pages/manager/Configuracoes";
import LoginForm from "./pages/auth/LoginForm";   
import Cadastro  from "./pages/auth/Cadastro";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/intencao" element={<Intencao />} />
        <Route path="/avaliar" element={<Avaliacao />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/cardapio" element={<Cardapio />} />
        <Route path="/producao" element={<Producao />} />
        <Route path="/relatorio" element={<Relatorio />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/login-form" element={<LoginForm />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;