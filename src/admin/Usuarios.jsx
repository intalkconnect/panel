import React, { useEffect, useState } from "react";
import { supabase } from "../data/supabaseClient";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Plus,
  Search,
  SquarePenIcon,
  Trash2,
  Users,
  KeyRound,
  ClipboardCopy,
} from "lucide-react";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [perfilOptions, setPerfilOptions] = useState([]);
  const [empresaOptions, setEmpresaOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usuarioEdicao, setUsuarioEdicao] = useState(null); // Para editar usuário
  const [usuarioCriacao, setUsuarioCriacao] = useState({
    email: "",
    perfil_id: "",
    empresa_id: "",
  });
  const [search, setSearch] = useState(""); // Para pesquisa
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // Para confirmação de exclusão
  const [showModal, setShowModal] = useState(false); // Controle do modal
  const [senhaResetada, setSenhaResetada] = useState(null);

  useEffect(() => {
    fetchUsuarios();
    fetchPerfis(); // Buscar os perfis disponíveis
    fetchEmpresas(); // Buscar as empresas disponíveis
  }, []);

  const isMaster = localStorage.getItem("perfil_nome") === "master";

  async function fetchUsuarios() {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("*, perfil_id(*), empresa_id(*)");

    if (error) {
      toast.error("Erro ao carregar usuários.");
    } else {
      setUsuarios(data);
    }
    setLoading(false);
  }

  async function fetchPerfis() {
    const { data, error } = await supabase.from("perfis").select("id, nome");

    if (error) toast.error("Erro ao buscar perfis");
    else setPerfilOptions(data);
  }

  async function fetchEmpresas() {
    const { data, error } = await supabase.from("empresas").select("id, nome");

    if (error) toast.error("Erro ao buscar empresas");
    else setEmpresaOptions(data);
  }

  async function excluirUsuario(id) {
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir usuário.");
    } else {
      toast.success("Usuário excluído com sucesso.");
      fetchUsuarios(); // Atualizar lista de usuários após exclusão
    }

    setConfirmDeleteId(null); // Fechar modal de confirmação
  }

  async function editarUsuario() {
    setLoading(true);
    const { error } = await supabase
      .from("users")
      .update({
        email: usuarioEdicao.email, // Alterar apenas o email, mas você pode adicionar outros campos
        perfil_id: usuarioEdicao.perfil_id, // Alterar o perfil do usuário
        empresa_id: usuarioEdicao.empresa_id, // Alterar a empresa associada ao usuário
      })
      .eq("id", usuarioEdicao.id);

    if (error) {
      toast.error("Erro ao editar usuário.");
    } else {
      toast.success("Usuário editado com sucesso.");
      setUsuarioEdicao(null); // Fechar o modal de edição
      fetchUsuarios(); // Atualizar a lista de usuários
    }
    setLoading(false);
  }

  async function resetarSenha(usuario) {
    if (!usuario?.id) {
      toast.error("Usuário inválido para resetar senha.");
      return;
    }

    const novaSenha = Math.random().toString(36).slice(-10);

    const { error } = await supabase
      .from("users")
      .update({
        senha: novaSenha,
        email: usuario.email,
        perfil_id: usuario.perfil_id?.id || usuario.perfil_id,
        empresa_id: usuario.empresa_id?.id || usuario.empresa_id,
      })
      .eq("id", usuario.id);

    if (error) {
      console.error("Erro ao resetar senha:", error);
      toast.error("Erro ao resetar senha.");
    } else {
      setSenhaResetada({ email: usuario.email, senha: novaSenha }); // Exibir na UI
      toast.success("Senha resetada com sucesso!");
    }
  }

  async function criarUsuario() {
    setLoading(true);
    const { error } = await supabase.from("users").insert({
      email: usuarioCriacao.email,
      perfil_id: usuarioCriacao.perfil_id,
      empresa_id: usuarioCriacao.empresa_id,
    });

    if (error) {
      toast.error("Erro ao criar usuário.");
    } else {
      toast.success("Usuário criado com sucesso.");
      setUsuarioCriacao({ email: "", perfil_id: "", empresa_id: "" }); // Limpar campos
      fetchUsuarios(); // Atualizar lista de usuários
      setShowModal(false); // Fechar o modal
    }
    setLoading(false);
  }

  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-blue-500 dark:text-blue-400" />
          <h1 className="text-2xl font-bold">Usuários</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} /> Novo Usuário
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar por email..."
          className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-auto rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-gray-800 font-bold text-gray-800 dark:text-white">
            <tr>
              <th className="p-3 border text-center">Email</th>
              <th className="p-3 border text-center">Perfil</th>
              {isMaster && <th className="p-3 border text-center">Empresa</th>}
              <th className="p-3 border text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((usuario) => (
              <tr
                key={usuario.id}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <td className="p-3 border text-center">{usuario.email}</td>
                <td className="p-3 border text-center">
                  {usuario.perfil_id ? usuario.perfil_id.nome : "N/A"}
                </td>
                {isMaster && (
                  <td className="p-3 border text-center">
                    {usuario.empresa_id ? usuario.empresa_id.nome : "N/A"}
                  </td>
                )}
                <td className="p-3 border text-center space-x-2">
                  <button
                    className="p-2 rounded-full hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 dark:hover:bg-blue-700 transition"
                    onClick={() => setUsuarioEdicao(usuario)}
                  >
                    <SquarePenIcon size={18} />
                  </button>
                  <button
                    className="p-2 rounded-full hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 dark:hover:bg-red-700 transition"
                    onClick={() => setConfirmDeleteId(usuario.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    className="p-2 rounded-full hover:bg-yellow-500 hover:text-white text-yellow-600 dark:text-yellow-400 dark:hover:bg-yellow-600 transition"
                    onClick={() => resetarSenha(usuario)}
                  >
                    <KeyRound size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {senhaResetada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-xl max-w-sm w-full shadow-lg text-center">
            <h3 className="text-lg font-bold mb-2">
              Senha redefinida com sucesso
            </h3>
            <p className="mb-4 text-sm">
              Usuário: <strong>{senhaResetada.email}</strong>
            </p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <code className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono">
                {senhaResetada.senha}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(senhaResetada.senha);
                  toast.success("Senha copiada!");
                }}
                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                title="Copiar senha"
              >
                <ClipboardCopy size={18} />
              </button>
            </div>

            <button
              onClick={() => setSenhaResetada(null)}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-lg text-gray-900 dark:text-white">
            <h2 className="text-xl font-bold mb-4">Adicionar Usuário</h2>

            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              value={usuarioCriacao.email}
              onChange={(e) =>
                setUsuarioCriacao({ ...usuarioCriacao, email: e.target.value })
              }
              className="w-full border px-3 py-2 rounded mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />

            <label className="block text-sm font-semibold mb-1">Perfil</label>
            <select
              value={usuarioCriacao.perfil_id}
              onChange={(e) =>
                setUsuarioCriacao({
                  ...usuarioCriacao,
                  perfil_id: e.target.value,
                })
              }
              className="w-full border px-3 py-2 rounded mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Selecione um Perfil</option>
              {perfilOptions.map((perfil) => (
                <option key={perfil.id} value={perfil.id}>
                  {perfil.nome}
                </option>
              ))}
            </select>

            <label className="block text-sm font-semibold mb-1">Empresa</label>
            <select
              value={usuarioCriacao.empresa_id}
              onChange={(e) =>
                setUsuarioCriacao({
                  ...usuarioCriacao,
                  empresa_id: e.target.value,
                })
              }
              className="w-full border px-3 py-2 rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Selecione uma Empresa</option>
              {empresaOptions.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={criarUsuario}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-semibold"
              >
                {loading ? "Criando..." : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {usuarioEdicao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-lg text-gray-900 dark:text-white">
            <h2 className="text-xl font-bold mb-4">Editar Usuário</h2>

            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              value={usuarioEdicao.email}
              onChange={(e) =>
                setUsuarioEdicao({ ...usuarioEdicao, email: e.target.value })
              }
              className="w-full border px-3 py-2 rounded mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />

            <label className="block text-sm font-semibold mb-1">Perfil</label>
            <select
              value={usuarioEdicao.perfil_id?.id || ""}
              onChange={(e) =>
                setUsuarioEdicao({
                  ...usuarioEdicao,
                  perfil_id: e.target.value,
                })
              }
              className="w-full border px-3 py-2 rounded mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Selecione um Perfil</option>
              {perfilOptions.map((perfil) => (
                <option key={perfil.id} value={perfil.id}>
                  {perfil.nome}
                </option>
              ))}
            </select>

            <label className="block text-sm font-semibold mb-1">Empresa</label>
            <select
              value={usuarioEdicao.empresa_id?.id || ""}
              onChange={(e) =>
                setUsuarioEdicao({
                  ...usuarioEdicao,
                  empresa_id: e.target.value,
                })
              }
              className="w-full border px-3 py-2 rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Selecione uma Empresa</option>
              {empresaOptions.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUsuarioEdicao(null)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={editarUsuario}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold"
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-sm w-full shadow-lg text-center text-gray-900 dark:text-white">
            <h3 className="text-lg font-bold mb-4">
              Tem certeza que deseja excluir?
            </h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={() => excluirUsuario(confirmDeleteId)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
