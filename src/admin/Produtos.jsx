import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../data/supabaseClient";
import { toast } from "react-toastify";
import { Trash2, Search, Plus, Boxes, SquarePenIcon, Eye } from "lucide-react";

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [detalhamento, setDetalhamento] = useState({
    descricao: "",
    extras: [],
    remover: [],
  });
  const fileInputRef = useRef();
  const isMaster = localStorage.getItem("perfil_nome") === "master";

  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    preco: "",
    quantidade: 0,
    imagem_url: "",
    ativo: true,
    categoria_id: "",
  });

  useEffect(() => {
    fetchProdutos();
    fetchCategorias();
  }, []);

  async function fetchCategorias() {
    const empresaId = localStorage.getItem("empresa_id");
    let query = supabase.from("categorias").select("id, nome");

    if (!isMaster) {
      query = query.eq("empresa_id", empresaId);
    }

    const { data, error } = await query;
    if (!error) setCategorias(data);
  }

  async function fetchProdutos() {
    const empresaId = localStorage.getItem("empresa_id");
    let query = supabase.from("produtos").select(`
      id, nome, preco, imagem_url, quantidade, ativo, categoria_id, empresa_id,
      detalhamento, categorias (nome), empresas (nome)
    `);
    if (!isMaster && empresaId) query = query.eq("empresa_id", empresaId);
    const { data, error } = await query;
    if (error) toast.error("Erro ao buscar produtos");
    else setProdutos(data);
  }

  async function uploadImagem(file) {
    const fileName = `produtos/${Date.now()}-${file.name}`;
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

  async function salvarProduto() {
    setLoading(true);

    const empresaId = localStorage.getItem("empresa_id");
    let imagem_url = novoProduto.imagem_url;

    if (fileInputRef.current.files[0]) {
      const url = await uploadImagem(fileInputRef.current.files[0]);
      if (url) imagem_url = url;
    }

    if (!novoProduto.nome || !novoProduto.preco || !novoProduto.categoria_id) {
      toast.warning("Preencha todos os campos obrigatórios.");
      setLoading(false);
      return;
    }

    const payload = {
      ...novoProduto,
      preco: Number(novoProduto.preco),
      quantidade: Number(novoProduto.quantidade),
      imagem_url,
      empresa_id: empresaId,
    };

    if (editando) {
      const { error } = await supabase
        .from("produtos")
        .update(payload)
        .eq("id", editando.id);

      if (!error) {
        toast.success("Produto atualizado!");
      } else {
        toast.error("Erro ao atualizar produto.");
      }
    } else {
      const { error } = await supabase.from("produtos").insert([payload]);
      if (!error) {
        toast.success("Produto criado!");
      } else {
        toast.error("Erro ao criar produto.");
      }
    }

    setNovoProduto({
      nome: "",
      preco: "",
      quantidade: 0,
      imagem_url: "",
      ativo: true,
      categoria_id: "",
    });
    setEditando(null);
    setShowModal(false);
    setLoading(false);
    fetchProdutos();
  }

  async function excluirProduto(id) {
    const { error } = await supabase.from("produtos").delete().eq("id", id);
    if (!error) {
      toast.success("Produto excluído!");
      fetchProdutos();
    } else {
      toast.error("Erro ao excluir produto.");
    }
    setConfirmDeleteId(null);
  }

  const produtosFiltrados = produtos.filter((produto) => {
    if (isMaster) {
      return produto.empresas?.nome
        ?.toLowerCase()
        .includes(busca.toLowerCase());
    } else {
      return produto.nome.toLowerCase().includes(busca.toLowerCase());
    }
  });

  function abrirDetalhamento(produto) {
    let parsed = { descricao: "", extras: [], remover: [] };
    try {
      parsed = produto.detalhamento ? JSON.parse(produto.detalhamento) : parsed;
    } catch (err) {
      console.error("Erro ao parsear detalhamento:", err);
    }
    setProdutoSelecionado(produto);
    setDetalhamento(parsed);
    setShowDetalhesModal(true);
  }

  function adicionarItem(tipo) {
    setDetalhamento((prev) => ({
      ...prev,
      [tipo]: [...prev[tipo], { id: crypto.randomUUID(), label: "" }],
    }));
  }

  function atualizarLabel(tipo, index, valor) {
    const copia = [...detalhamento[tipo]];
    copia[index].label = valor;
    setDetalhamento((prev) => ({ ...prev, [tipo]: copia }));
  }

  function removerItem(tipo, index) {
    const copia = detalhamento[tipo].filter((_, i) => i !== index);
    setDetalhamento((prev) => ({ ...prev, [tipo]: copia }));
  }

  async function salvarDetalhamento() {
    if (!produtoSelecionado?.id) return;
    const { error } = await supabase
      .from("produtos")
      .update({ detalhamento: JSON.stringify(detalhamento) })
      .eq("id", produtoSelecionado.id);

    if (error) {
      toast.error("Erro ao salvar detalhamento.");
    } else {
      toast.success("Detalhamento salvo com sucesso!");
      fetchProdutos();
    }
    setShowDetalhesModal(false);
  }

  return (
    <div className="p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Boxes size={24} className="text-blue-500 dark:text-blue-400" />
          <h1 className="text-2xl font-bold">Produtos</h1>
        </div>
        <button
          onClick={() => {
            setNovoProduto({
              nome: "",
              preco: "",
              quantidade: 0,
              imagem_url: "",
              ativo: true,
              categoria_id: "",
            });
            setEditando(null);
            setShowModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} /> Novo Produto
        </button>
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Busca por produto..."
          className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>
      <div className="overflow-auto rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-gray-800 font-bold text-gray-800 dark:text-white">
            <tr>
              <th className="p-3 border text-center">Produto</th>
              <th className="p-3 border text-center">Preço</th>
              <th className="p-3 border text-center">Quantidade</th>
              <th className="p-3 border text-center">Imagem</th>
              <th className="p-3 border text-center">Categoria</th>
              {isMaster && <th className="p-3 text-center border">Empresa</th>}
              <th className="p-3 text-center border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtosFiltrados.length > 0 ? (
              produtosFiltrados.map((produto) => (
                <tr
                  key={produto.id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="p-3 text-center border">{produto.nome}</td>
                  <td className="p-3 text-center border">
                    R$ {Number(produto.preco).toFixed(2)}
                  </td>
                  <td className="p-3 text-center border">
                    {produto.quantidade ?? 0}
                  </td>
                  <td className="p-3 border">
                    <div className="flex items-center justify-center h-full">
                      {produto.imagem_url ? (
                        <img
                          src={produto.imagem_url}
                          alt={produto.nome}
                          className="w-20 h-20 object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-center">
                          Sem imagem
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-center border">
                    {produto.categorias?.nome || "—"}
                  </td>
                  {isMaster && (
                    <td className="p-3 text-center border">
                      {produto.empresas?.nome || "—"}
                    </td>
                  )}
                  <td className="p-3 border text-center space-x-2">
                    <button
                      className="p-2 rounded-full hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 dark:hover:bg-blue-700 transition"
                      onClick={() => {
                        setNovoProduto(produto);
                        setEditando(produto);
                        setShowModal(true);
                      }}
                    >
                      <SquarePenIcon size={18} />
                    </button>
                    <button
                      className="p-2 rounded-full hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 dark:hover:bg-red-700 transition"
                      onClick={() => setConfirmDeleteId(produto.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      className="p-2 rounded-full hover:bg-yellow-500 hover:text-white text-yellow-600 dark:text-yellow-400 dark:hover:bg-yellow-600 transition"
                      title="Detalhes"
                      onClick={() => abrirDetalhamento(produto)}
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="p-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Modais */}
      {showDetalhesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-xl overflow-y-auto max-h-[90vh] text-gray-900 dark:text-gray-100">
            <h2 className="text-xl font-bold mb-4">Detalhamento</h2>

            <label className="block mb-1 font-medium">Descrição</label>
            <textarea
              className="w-full border p-2 rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={detalhamento.descricao}
              onChange={(e) =>
                setDetalhamento({ ...detalhamento, descricao: e.target.value })
              }
            />

            <div className="mb-4">
              <label className="block font-semibold mb-1">Extras</label>
              {detalhamento.extras.map((extra, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    className="border p-1 rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={extra.label}
                    onChange={(e) =>
                      atualizarLabel("extras", index, e.target.value)
                    }
                  />
                  <button
                    onClick={() => removerItem("extras", index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => adicionarItem("extras")}
                className="text-blue-600 text-sm"
              >
                + Adicionar Extra
              </button>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">
                Itens para Remover
              </label>
              {detalhamento.remover.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    className="border p-1 rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={item.label}
                    onChange={(e) =>
                      atualizarLabel("remover", index, e.target.value)
                    }
                  />
                  <button
                    onClick={() => removerItem("remover", index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => adicionarItem("remover")}
                className="text-blue-600 text-sm"
              >
                + Adicionar Item
              </button>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
                onClick={() => setShowDetalhesModal(false)}
              >
                Fechar
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={salvarDetalhamento}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl text-center text-gray-900 dark:text-gray-100">
            <h2 className="text-lg font-bold mb-4">Excluir produto?</h2>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={() => excluirProduto(confirmDeleteId)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-lg text-gray-900 dark:text-gray-100">
            <h2 className="text-xl font-bold mb-4">
              {editando ? "Editar Produto" : "Novo Produto"}
            </h2>

            <label className="block mb-1 font-semibold">Nome</label>
            <input
              type="text"
              value={novoProduto.nome}
              onChange={(e) =>
                setNovoProduto({ ...novoProduto, nome: e.target.value })
              }
              className="w-full border px-3 py-2 rounded mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />

            <label className="block mb-1 font-semibold">Preço</label>
            <input
              type="number"
              value={novoProduto.preco}
              onChange={(e) =>
                setNovoProduto({ ...novoProduto, preco: e.target.value })
              }
              className="w-full border px-3 py-2 rounded mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />

            <label className="block mb-1 font-semibold">Quantidade</label>
            <input
              type="number"
              value={novoProduto.quantidade}
              onChange={(e) =>
                setNovoProduto({ ...novoProduto, quantidade: e.target.value })
              }
              className="w-full border px-3 py-2 rounded mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />

            <label className="block mb-1 font-semibold">Categoria</label>
            <select
              value={novoProduto.categoria_id}
              onChange={(e) =>
                setNovoProduto({ ...novoProduto, categoria_id: e.target.value })
              }
              className="w-full border px-3 py-2 rounded mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Selecione</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>

            <label className="block mb-1 font-semibold">Imagem</label>
            <input type="file" ref={fileInputRef} className="w-full mb-4" />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditando(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={salvarProduto}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Produtos;
