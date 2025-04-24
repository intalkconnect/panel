// components/admin/Chatbot.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bot } from "lucide-react";

const Chatbot = () => {
  const [chatbotAtivo, setChatbotAtivo] = useState(false);
  const [qrcodeBase64, setQrcodeBase64] = useState("");
  const [statusConexao, setStatusConexao] = useState("");
  const [tentativasEsgotadas, setTentativasEsgotadas] = useState(false);
  const [carregandoQRCode, setCarregandoQRCode] = useState(false);
  const empresaId = localStorage.getItem("empresa_id");

  const verificarStatus = async () => {
    setCarregandoQRCode(true);
    try {
      const res = await axios.get(
        `https://mensageria-backend-n8n.9j9goo.easypanel.host/webhook/instance?id=${empresaId}`
      );

      const { status, base64 } = res.data;

      if (status === "conectado") {
        setChatbotAtivo(true);
        setStatusConexao("Conectado ✅");
        setQrcodeBase64("");
      } else if (status === "conectando") {
        setChatbotAtivo(false); // ainda não está conectado de fato
        setStatusConexao("Aguardando conexão...");
        setQrcodeBase64(base64 || "");
      } else {
        setStatusConexao("Falha na conexão. Tente novamente.");
        setTentativasEsgotadas(true);
      }
    } catch (err) {
      console.error("Erro ao verificar status:", err);
      setStatusConexao("Erro ao conectar.");
    } finally {
      setCarregandoQRCode(false);
    }
  };

  useEffect(() => {
    verificarStatus();
  }, []);

  const handleToggle = async () => {
    if (chatbotAtivo) {
      // Se desativando, apaga a instância
      setChatbotAtivo(false);
      setStatusConexao("Desconectando...");

      try {
        await axios.delete(
          `https://wa-srv.dkdevs.com.br/instance/logout/${empresaId}`,
          {
            headers: {
              apikey:
                "nxSU2UP8m9p5bfjh32FR5KqDeq5cdp7PtETBI67d04cf59437f",
            },
          }
        );
      } catch (_) {
        // ignora
      } finally {
        await axios.delete(
          `https://wa-srv.dkdevs.com.br/instance/delete/${empresaId}`,
          {
            headers: {
              apikey:
                "nxSU2UP8m9p5bfjh32FR5KqDeq5cdp7PtETBI67d04cf59437f",
            },
          }
        );

        setStatusConexao("");
        setQrcodeBase64("");
        setTentativasEsgotadas(false);
      }
    } else {
      // Se ativando, tenta conectar (gera QRCode ou ativa direto)
      await verificarStatus();
    }
  };

  const handleRetry = () => {
    setTentativasEsgotadas(false);
    verificarStatus();
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow border dark:border-gray-700 space-y-4">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Bot className="text-blue-500" />
          <h2 className="text-lg font-semibold">Chatbot</h2>
        </div>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            chatbotAtivo ? "bg-blue-600" : "bg-gray-400"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              chatbotAtivo ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {carregandoQRCode && (
        <div className="flex justify-center items-center h-64">
          <svg
            className="animate-spin h-10 w-10 text-black"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
            ></path>
          </svg>
        </div>
      )}

      {qrcodeBase64 && (
        <div className="flex justify-center">
          <img
            src={qrcodeBase64}
            alt="QRCode"
            className="w-64 h-64 filter grayscale contrast-200"
          />
        </div>
      )}

      {tentativasEsgotadas && (
        <div className="text-center">
          <button
            onClick={handleRetry}
            className="px-4 py-2 mt-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {statusConexao && (
        <p className="text-center text-sm text-gray-700 dark:text-gray-300">
          {statusConexao}
        </p>
      )}
    </div>
  );
};

export default Chatbot;
