import React, { useState } from "react";
import { Bot, Moon, Settings, Building2, Palette } from "lucide-react";
import HorariosFuncionamento from "../components/admin/HorariosFuncionamento";

const Configuracoes = () => {
  const [chatbotAtivo, setChatbotAtivo] = useState(false);

  return (
    <div className="p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 space-y-6">
      {/* Título principal */}
      <div className="flex items-center gap-3 mb-4">
        <Settings className="text-blue-500 dark:text-blue-400" />
        <h1 className="text-2xl font-bold">Configurações Gerais</h1>
      </div>

      {/* Temas do Totem */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow border dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="text-purple-500" />
          <h2 className="text-xl font-semibold">Temas do Totem</h2>
        </div>
        <label className="block mb-2 text-sm font-medium">
          Selecione o tema:
        </label>
        <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <option>Claro</option>
          <option>Escuro</option>
          <option>Automático</option>
        </select>
      </div>

      {/* Configurações do Totem */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow border dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="text-orange-500" />
          <h2 className="text-xl font-semibold">Configurações do Totem</h2>
        </div>
        <label className="flex items-center gap-2 text-sm mb-2">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          Exibir relógio na tela inicial
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          Ativar modo silencioso
        </label>
      </div>

      {/* Configurações da Empresa */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow border dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="text-green-600" />
          <h2 className="text-xl font-semibold">Configurações da Empresa</h2>
        </div>
        <label className="block text-sm font-medium mb-1">
          Nome da empresa:
        </label>
        <input
          type="text"
          placeholder="Digite aqui..."
          className="w-full px-3 py-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <label className="block text-sm font-medium mb-1">
          Email de contato:
        </label>
        <input
          type="email"
          placeholder="email@empresa.com"
          className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <HorariosFuncionamento />

      {/* Ativar/Desativar Chatbot */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow border dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="text-blue-500" />
          <h2 className="text-lg font-semibold">Chatbot Virtual</h2>
        </div>
        {/* Toggle */}
        <button
          onClick={() => setChatbotAtivo(!chatbotAtivo)}
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
    </div>
  );
};

export default Configuracoes;
