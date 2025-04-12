import { supabase } from "../data/supabaseClient";

export async function carregarDados(empresaId) {
    const [empresaRes, categoriasRes, produtosRes] = await Promise.all([
        supabase.from("empresas").select("*").eq("id", empresaId).single(),
        supabase
            .from("categorias")
            .select("*")
            .eq("empresa_id", empresaId)
            .order("id", { ascending: true }),
        supabase
            .from("produtos")
            .select("*")
            .eq("empresa_id", empresaId)
            .eq("ativo", true)
            .order("id", { ascending: true }),
    ]);

    const empresa = empresaRes.data;
    const categorias = categoriasRes.data;
    const produtos = (produtosRes.data || []).map((produto) => ({
        ...produto,
        detalhamento:
            typeof produto.detalhamento === "string"
                ? JSON.parse(produto.detalhamento)
                : produto.detalhamento,
    }));

    if (empresaRes.error || categoriasRes.error || produtosRes.error) {
        console.error("Erro ao carregar dados:", {
            empresa: empresaRes.error,
            categorias: categoriasRes.error,
            produtos: produtosRes.error,
        });
    }

    return { empresa, categorias, produtos };
}
