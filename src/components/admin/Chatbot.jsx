import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bot, RotateCcw } from "lucide-react";

const Chatbot = () => {
  const [chatbotAtivo, setChatbotAtivo] = useState(false);
  const [qrcodeBase64, setQrcodeBase64] = useState("");
  const [statusConexao, setStatusConexao] = useState("");
  const [tentativas, setTentativas] = useState(0);
  const [tentativasEsgotadas, setTentativasEsgotadas] = useState(false);
  const [carregandoQRCode, setCarregandoQRCode] = useState(false);
  const empresaId = localStorage.getItem("empresa_id");

  useEffect(() => {
    let interval;

    if (chatbotAtivo && qrcodeBase64 && !tentativasEsgotadas) {
      interval = setInterval(() => {
        setTentativas((prev) => {
          const nova = prev + 1;

          axios
            .get(`https://wa-srv.dkdevs.com.br/instance/connectionState/${empresaId}`, {
              headers: {
                apikey: "nxSU2UP8m9p5bfjh32FR5KqDeq5cdp7PtETBI67d04cf59437f",
              },
            })
            .then((res) => {
              if (res.data.instance?.state === "connected") {
                clearInterval(interval);
                setStatusConexao("Conectado ✅");
                setQrcodeBase64("");
              }
            })
            .catch(() => {
              // ignora erro
            });

          if (nova >= 4) {
            clearInterval(interval);
            setQrcodeBase64(""); // <-- Remove QRCode ao esgotar
            setTentativasEsgotadas(true);
            setStatusConexao("Falha na conexão");
          }

          return nova;
        });
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [chatbotAtivo, qrcodeBase64]);

  const handleToggle = async () => {
    if (chatbotAtivo) {
      setChatbotAtivo(false);
      setStatusConexao("Desconectando...");

      // Apenas logout
      try {
        await axios.delete(`https://wa-srv.dkdevs.com.br/instance/logout/${empresaId}`, {
          headers: {
            apikey: "nxSU2UP8m9p5bfjh32FR5KqDeq5cdp7PtETBI67d04cf59437f",
          },
        });
      } catch (_) {}

      setStatusConexao("");
      setQrcodeBase64("");
      setTentativasEsgotadas(false);
    } else {
      setChatbotAtivo(true);
      setCarregandoQRCode(true);

      try {
        const res = await axios.get(
          `https://mensageria-backend-n8n.9j9goo.easypanel.host/webhook/instance?id=${empresaId}`
        );

        const { status, base64 } = res.data;

        if (status === "conectado") {
          setStatusConexao("Conectado ✅");
        } else if (status === "conectando") {
          setStatusConexao("Aguardando conexão...");
          setQrcodeBase64(base64 || "");
          setTentativas(0);
          setTentativasEsgotadas(false);
        }
      } catch (err) {
        console.error("Erro ao consultar status:", err);
        setChatbotAtivo(false);
        setStatusConexao("Erro ao conectar");
      } finally {
        setCarregandoQRCode(false);
      }
    }
  };

  const handleRetry = async () => {
    setCarregandoQRCode(true);
    setTentativas(0);
    setTentativasEsgotadas(false);

    try {
      const res = await axios.get(
        `https://wa-srv.dkdevs.com.br/instance/connect/${empresaId}`,
        {
          headers: {
            apikey: "nxSU2UP8m9p5bfjh32FR5KqDeq5cdp7PtETBI67d04cf59437f",
          },
        }
      );

      setQrcodeBase64(res.data.base64 || "");
      setStatusConexao("Aguardando conexão...");
    } catch (err) {
      console.error("Erro ao tentar reconectar:", err);
      setStatusConexao("Erro na reconexão");
    } finally {
      setCarregandoQRCode(false);
    }
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
          <svg className="animate-spin h-10 w-10 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
            ></path>
          </svg>
        </div>
      )}

      {qrcodeBase64 && !tentativasEsgotadas && (
        <div className="flex justify-center">
          <img
            src={qrcodeBase64}
            alt="QRCode"
            className="w-64 h-64 filter grayscale contrast-200"
          />
        </div>
      )}

      {tentativasEsgotadas && (
        <div className="flex justify-center">
          <button
            onClick={handleRetry}
            className="text-blue-600 hover:text-blue-800"
            title="Tentar novamente"
          >
            <RotateCcw size={28} />
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
