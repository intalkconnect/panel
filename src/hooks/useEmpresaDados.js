import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function useEmpresaDados(empresaId, enabled = true) {
    const [categorias, setCategorias] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [empresa, setEmpresa] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const carregar = async () => {
            setLoading(true);
            const [{ data: cats }, { data: prods }, { data: emp }] = await Promise.all([
                supabase.from("categorias").select("*").eq("empresa_id", empresaId),
                supabase.from("produtos").select("*").eq("empresa_id", empresaId).eq("ativo", true),
                supabase.from("empresas").select("*").eq("id", empresaId).single(),
            ]);

            setCategorias(cats || []);
            setProdutos(
                (prods || []).map((p) => ({
                    ...p,
                    detalhamento: typeof p.detalhamento === "string"
                        ? JSON.parse(p.detalhamento)
                        : p.detalhamento,
                }))
            );
            setEmpresa(emp || null);
            setLoading(false);
        };

        if (empresaId && enabled) carregar();
    }, [empresaId, enabled]);

    return { categorias, produtos, empresa, loading };
}
