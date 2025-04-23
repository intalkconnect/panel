// components/admin/Chatbot.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bot } from "lucide-react";

const API_KEY = "nxSU2UP8m9p5bfjh32FR5KqDeq5cdp7PtETBI67d04cf59437f";

const Chatbot = () => {
  const [chatbotAtivo, setChatbotAtivo] = useState(false);
  const [qrcodeBase64, setQrcodeBase64] = useState("");
  const [statusConexao, setStatusConexao] = useState("");
  const [tentativas, setTentativas] = useState(0);
  const [tentativasEsgotadas, setTentativasEsgotadas] = useState(false);
  const [carregandoQRCode, setCarregandoQRCode] = useState(false);

  const empresaId = localStorage.getItem("empresa_id");

  useEffect(() => {
    axios
      .get(
        `https://wa-srv.dkdevs.com.br/instance/connectionState/${empresaId}`,
        { headers: { apikey: API_KEY } }
      )
      .then((res) => {
        const conectado = res.data.instance?.state === "connected";
        setChatbotAtivo(conectado);
        if (conectado) {
          setStatusConexao("Conectado ✅");
        }
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setChatbotAtivo(false);
        } else {
          console.error("Erro ao verificar conexão inicial:", err);
        }
      });
  }, []);

  useEffect(() => {
    let interval;

    if (chatbotAtivo) {
      setTentativas(0);
      setTentativasEsgotadas(false);
      setCarregandoQRCode(true);

      axios
        .post(
          "https://wa-srv.dkdevs.com.br/instance/create",
          {
            instanceName: empresaId,
            qrcode: true,
            integration: "WHATSAPP-BAILEYS",
            groupsIgnore: true,
            webhook: {
              url: "https://mensageria-backend-n8n.9j9goo.easypanel.host/webhook/2add3ce5-aa7a-42dd-8ff4-f94ef7f08955",
              byEvents: false,
              base64: true,
              headers: {
                autorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
              },
              events: ["MESSAGES_UPSERT"],
            },
          },
          { headers: { apikey: API_KEY } }
        )
        .then((res) => {
          const base64 = res.data.qrcode?.base64;
          setQrcodeBase64(base64);
          setStatusConexao("Aguardando conexão...");
          setCarregandoQRCode(false);

          interval = setInterval(() => {
            setTentativas((prev) => {
              const novaTentativa = prev + 1;

              axios
                .get(
                  `https://wa-srv.dkdevs.com.br/instance/connectionState/${empresaId}`,
                  { headers: { apikey: API_KEY } }
                )
                .then((response) => {
                  if (response.data.instance?.state === "connected") {
                    setStatusConexao("Conectado ✅");
                    setQrcodeBase64("");
                    clearInterval(interval);
                  }
                });

              if (novaTentativa >= 4) {
                clearInterval(interval);
                setQrcodeBase64("");
                setStatusConexao("Falha na conexão. Tente novamente.");
                setTentativasEsgotadas(true);
              }

              return novaTentativa;
            });
          }, 5000);
        })
        .catch((err) => {
          console.error("Erro ao criar instância:", err);
          setCarregandoQRCode(false);
        });

      return () => clearInterval(interval);
    } else {
      if (statusConexao === "Conectado ✅") {
        // Apenas se estava conectado, então desloga e deleta
        axios
          .delete(
            `https://wa-srv.dkdevs.com.br/instance/logout/${empresaId}`,
            { headers: { apikey: API_KEY } }
          )
          .catch(() => {
            // Tenta delete direto se logout falhar
          })
          .finally(() => {
            axios
              .delete(
                `https://wa-srv.dkdevs.com.br/instance/delete/${empresaId}`,
                { headers: { apikey: API_KEY } }
              )
              .then(() => console.log("Instância deletada"))
              .catch((err) =>
                console.error("Erro ao deletar instância:", err)
              );
          });
      }

      setQrcodeBase64("");
      setStatusConexao("");
      setTentativasEsgotadas(false);
    }
  }, [chatbotAtivo]);

  const iniciarChecagemConexao = () => {
    let tentativasInternas = 0;
    setStatusConexao("Aguardando conexão...");
    const interval = setInterval(() => {
      tentativasInternas++;
      axios
        .get(
          `https://wa-srv.dkdevs.com.br/instance/connectionState/${empresaId}`,
          { headers: { apikey: API_KEY } }
        )
        .then((res) => {
          if (res.data.instance?.state === "connected") {
            setStatusConexao("Conectado ✅");
            setQrcodeBase64("");
            clearInterval(interval);
          }
        });
      if (tentativasInternas >= 4) {
        clearInterval(interval);
        setQrcodeBase64("");
        setStatusConexao("Falha na conexão. Tente novamente.");
        setTentativasEsgotadas(true);
      }
    }, 5000);
  };

  const handleRetry = () => {
    setTentativasEsgotadas(false);
    setStatusConexao("Aguardando conexão...");
    setCarregandoQRCode(true);

    axios
      .get(
        `https://wa-srv.dkdevs.com.br/instance/connect/${empresaId}`,
        { headers: { apikey: API_KEY } }
      )
      .then((res) => {
        setQrcodeBase64(res.data.qrcode?.base64);
        setCarregandoQRCode(false);
        iniciarChecagemConexao();
      })
      .catch((err) => {
        console.error("Erro ao tentar reconectar:", err);
        setCarregandoQRCode(false);
      });
  };

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
            className="w-64 h-64 filter contrast-200"
          />
        </div>
      )}

      {statusConexao && (
        <p className="text-center text-sm text-gray-700 dark:text-gray-300">
          {statusConexao}
        </p>
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
    </div>
  );
};

export default Chatbot;
