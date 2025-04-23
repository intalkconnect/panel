// components/admin/Chatbot.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bot } from "lucide-react";

const Chatbot = () => {
  const [chatbotAtivo, setChatbotAtivo] = useState(false);
  const [qrcodeBase64, setQrcodeBase64] = useState("");
  const [statusConexao, setStatusConexao] = useState("");
  const empresaId = localStorage.getItem("empresa_id");

  useEffect(() => {
    let interval;

    if (chatbotAtivo) {
      // Criação da instância
      axios
        .post("https://wa-srv.dkdevs.com.br/instance/create", {
          instanceName: empresaId,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS",
          groupsIgnore: true,
          webhook: {
            url: "https://mensageria-backend-n8n.9j9goo.easypanel.host/webhook/2add3ce5-aa7a-42dd-8ff4-f94ef7f08955",
            byEvents: false,
            base64: true,
            headers: {
              autorization:
                "Bearer nxSU2UP8m9p5bfjh32FR5KqDeq5cdp7PtETBI67d04cf59437f",
              "Content-Type": "application/json",
            },
            events: ["MESSAGES_UPSERT"],
          },
        })
        .then((res) => {
          const base64 = res.data.qrcode?.base64;
          setQrcodeBase64(base64);
          setStatusConexao("Aguardando conexão...");

          // Inicia checagem a cada 5s
          interval = setInterval(() => {
            axios
              .get(
                `https://wa-srv.dkdevs.com.br/instance/connectionState/${empresaId}`,
                {
                  headers: {
                    apikey:
                      "nxSU2UP8m9p5bfjh32FR5KqDeq5cdp7PtETBI67d04cf59437f",
                  },
                }
              )
              .then((response) => {
                const state = response.data.instance?.state;
                if (state === "connected") {
                  setStatusConexao("Conectado ✅");
                  setQrcodeBase64("");
                  clearInterval(interval);
                }
              })
              .catch(console.error);
          }, 5000);
        })
        .catch((err) => {
          console.error("Erro ao criar instância:", err);
        });

      // Limpa o interval ao desativar
      return () => clearInterval(interval);
    } else {
      setQrcodeBase64("");
      setStatusConexao("");
    }
  }, [chatbotAtivo]);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow border dark:border-gray-700 space-y-4">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Bot className="text-blue-500" />
          <h2 className="text-lg font-semibold">Chatbot</h2>
        </div>
        <button
          onClick={() => setChatbotAtivo((prev) => !prev)}
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

      {qrcodeBase64 && (
        <div className="flex justify-center">
          <img src={qrcodeBase64} alt="QRCode" className="w-64 h-64" />
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
