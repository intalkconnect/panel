import React, { useState, useEffect } from "react";
import { supabase } from "../data/supabaseClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setsenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const logoutMsg = localStorage.getItem("logout_msg");
    const rememberedEmail = localStorage.getItem("remembered_email");

    if (logoutMsg) {
      toast.info(logoutMsg);
      localStorage.removeItem("logout_msg");
    }

    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setLembrar(true);
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !senha) {
      toast.warning("Preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("email, perfil_id, empresa_id")
        .eq("email", email)
        .eq("senha", senha)
        .maybeSingle();

      if (!user || error) {
        throw new Error("Email e senha não conferem.");
      }

      const { data: empresaData } = await supabase
        .from("empresas")
        .select("nome")
        .eq("id", user.empresa_id)
        .maybeSingle();

      const { data: perfilData } = await supabase
        .from("perfis")
        .select("nome")
        .eq("id", user.perfil_id)
        .maybeSingle();

      if (!empresaData || !perfilData) {
        throw new Error("Erro ao recuperar dados da empresa ou perfil.");
      }

      localStorage.setItem("empresa_id", user.empresa_id);
      localStorage.setItem("empresa_nome", empresaData.nome);
      localStorage.setItem("perfil_id", user.perfil_id);
      localStorage.setItem("perfil_nome", perfilData.nome);

      if (lembrar) {
        localStorage.setItem("remembered_email", email);
      } else {
        localStorage.removeItem("remembered_email");
      }

      toast.success("Login realizado com sucesso!");
      navigate("/admin");
    } catch (e) {
      toast.error(e.message || "Erro ao tentar fazer login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F74036] px-4">
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 30 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="bg-white shadow-xl p-8 rounded-2xl w-full max-w-sm border border-red-100"
  >
    {/* LOGO atualizada */}
    <div className="flex justify-center mb-8">
      <img
        src="https://onyedkfjdkplbaxpetln.supabase.co/storage/v1/object/public/zapediu//logoWP.png"
        alt="Zapediu Logo"
        className="w-32 h-auto object-contain"
      />
    </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="exemplo@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setsenha(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Lembrar-me */}
        <div className="flex items-center justify-between mb-6 text-sm">
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={lembrar}
              onChange={() => setLembrar(!lembrar)}
              className="rounded"
            />
            Lembrar meu email
          </label>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition duration-200"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </motion.div>
    </div>
  );
}

export default Login;
