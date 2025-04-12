import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../data/supabaseClient";
import { toast } from "react-toastify";
import { Plus, Search, Folder, SquarePenIcon, Trash2 } from "lucide-react";

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState({
    nome: "",
    ativo: true,
    imagem_url: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [busca, setBusca] = useState(""); // NOVO: estado da busca

  useEffect(() => {
    fetchCategorias();
  }, []);

  const isMaster = localStorage.getItem("perfil_nome") === "master";

  async function fetchCategorias() {
    const empresaId = localStorage.getItem("empresa_id");
    let query = supabase.from("categorias").select("*, empresas ( nome )");

    if (!isMaster) {
      query = query.eq("empresa_id", empresaId);
    }

    const { data, error } = await query;
    if (error) {
      toast.error("Erro ao buscar categorias");
    } else {
      setCategorias(data);
    }
  }

  async function adicionarCategoria() {
    setLoading(true);
    if (!novaCategoria.nome) {
      toast.warning("Preencha o nome da categoria.");
      setLoading(false);
      return;
    }

    let imagem_url = novaCategoria.imagem_url;

    if (fileInputRef.current.files[0]) {
      const file = fileInputRef.current.files[0];
      const url = await uploadImagem(file);
      if (url) {
        imagem_url = url;
      } else {
        setLoading(false);
        return;
      }
    }

    const empresaId = localStorage.getItem("empresa_id");

    const { data, error } = await supabase
      .from("categorias")
      .insert([{ ...novaCategoria, imagem_url, empresa_id: empresaId }]);

    if (error) {
      toast.error("Erro ao criar categoria.");
      setLoading(false);
      return;
    }

    toast.success("Categoria criada com sucesso.");
    setNovaCategoria({ nome: "", ativo: true, imagem_url: "" });
    fetchCategorias();
    setShowModal(false);
    setLoading(false);
  }

  async function editarCategoria() {
    setLoading(true);

    let imagem_url = editando.imagem_url;

    if (fileInputRef.current.files[0]) {
      const file = fileInputRef.current.files[0];
      const url = await uploadImagem(file);
      if (url) {
        imagem_url = url;
      } else {
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase
      .from("categorias")
      .update({
        nome: editando.nome,
        ativo: editando.ativo,
        imagem_url,
      })
      .eq("id", editando.id);

    if (error) {
      toast.error("Erro ao editar categoria.");
      setLoading(false);
      return;
    }

    toast.success("Categoria atualizada com sucesso.");
    setEditando(null);
    fetchCategorias();
    setShowModal(false);
    setLoading(false);
  }

  async function excluirCategoria(id) {
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir categoria.");
    } else {
      toast.success("Categoria excluída com sucesso.");
      fetchCategorias();
      setConfirmDeleteId(null);
    }
  }

  async function uploadImagem(file) {
    const fileName = `categorias/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("imagens")
      .upload(fileName, file);

    if (error) {
      toast.error("Erro ao fazer upload da imagem.");
      return null;
    }

    const { data } = supabase.storage.from("imagens").getPublicUrl(fileName);
    return data?.publicUrl || null;
  }

  function fecharModal() {
    setShowModal(false);
    setEditando(null);
  }

  // NOVO: filtro por nome
  const categoriasFiltradas = categorias.filter((cat) => {
    if (isMaster) {
      return cat.empresas?.nome?.toLowerCase().includes(busca.toLowerCase());
    } else {
      return cat.nome.toLowerCase().includes(busca.toLowerCase());
    }
  });

  return (
    <div className="p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Folder size={24} className="text-blue-500 dark:text-blue-400" />
          <h1 className="text-2xl font-bold">Categorias</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} /> Nova Categoria
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={
            isMaster
              ? "Buscar por nome da empresa"
              : "Buscar por nome da categoria"
          }
          className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>
      <div className="overflow-auto rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-gray-800 font-bold text-gray-800 dark:text-white">
            <tr>
              <th className="p-3 border text-center">Nome</th>
              <th className="p-3 border text-center">Ativo</th>
              <th className="p-3 border text-center">Imagem</th>
              {isMaster && <th className="p-3 border text-center">Empresa</th>}
              <th className="p-3 border text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categoriasFiltradas.map((categoria) => (
              <tr
                key={categoria.id}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <td className="p-3 border text-center">{categoria.nome}</td>
                <td className="p-3 border text-center">
                  {categoria.ativo ? "Sim" : "Não"}
                </td>
                <td className="p-3 border">
                  <div className="flex items-center justify-center h-full">
                    {categoria.imagem_url ? (
                      <img
                        src={categoria.imagem_url}
                        alt={categoria.nome}
                        className="w-20 h-20 object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 text-center">
                        Sem imagem
                      </span>
                    )}
                  </div>
                </td>

                {isMaster && (
                  <td className="p-3 border text-center">
                    {categoria.empresas?.nome}
                  </td>
                )}
                <td className="p-3 border text-center space-x-2">
                  <button
                    className="p-2 rounded-full hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 dark:hover:bg-blue-700 transition"
                    onClick={() => {
                      setEditando(categoria);
                      setShowModal(true);
                    }}
                  >
                    <SquarePenIcon size={18} />
                  </button>
                  <button
                    className="p-2 rounded-full hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 dark:hover:bg-red-700 transition"
                    onClick={() => setConfirmDeleteId(categoria.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-sm w-full shadow-lg text-center text-gray-900 dark:text-gray-100">
            <h3 className="text-lg font-bold mb-4">
              Tem certeza que deseja excluir a categoria?
            </h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={() => excluirCategoria(confirmDeleteId)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {(showModal || editando) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-lg text-gray-900 dark:text-gray-100">
            <h2 className="text-xl font-bold mb-4">
              {editando ? "Editar Categoria" : "Nova Categoria"}
            </h2>

            <label className="block text-sm font-semibold mb-1">Nome</label>
            <input
              type="text"
              placeholder="Nome"
              value={editando ? editando.nome : novaCategoria.nome}
              onChange={(e) =>
                editando
                  ? setEditando({ ...editando, nome: e.target.value })
                  : setNovaCategoria({ ...novaCategoria, nome: e.target.value })
              }
              className="w-full border px-3 py-2 rounded mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />

            <label className="block text-sm font-semibold mb-1">Ativo</label>
            <select
              value={editando ? editando.ativo : novaCategoria.ativo}
              onChange={(e) =>
                editando
                  ? setEditando({
                      ...editando,
                      ativo: e.target.value === "true",
                    })
                  : setNovaCategoria({
                      ...novaCategoria,
                      ativo: e.target.value === "true",
                    })
              }
              className="w-full border px-3 py-2 rounded mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>

            <label className="block text-sm font-semibold mb-1">Imagem</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files[0]) {
                  uploadImagem(e.target.files[0]).then((url) => {
                    if (editando) {
                      setEditando({ ...editando, imagem_url: url });
                    } else {
                      setNovaCategoria({ ...novaCategoria, imagem_url: url });
                    }
                  });
                }
              }}
              className="w-full mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={fecharModal}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={editando ? editarCategoria : adicionarCategoria}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-semibold"
              >
                {loading ? "Salvando..." : editando ? "Salvar" : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categorias;
