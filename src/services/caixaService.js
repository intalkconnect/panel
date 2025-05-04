import { supabase } from "../data/supabaseClient";

export async function abrirCaixa({ valorAbertura, abertoPor }) {
const empresaId = localStorage.getItem("empresa_id");

const { data, error } = await supabase
.from("caixas")
.insert({
empresa_id: empresaId,
valor_abertura: valorAbertura,
aberto_por: abertoPor,
})
.select()
.single();

if (error) throw error;
return data;
}

export async function fecharCaixa({ valorFechamento }) {
const empresaId = localStorage.getItem("empresa_id");

const { data: caixaAberto, error: buscaErro } = await supabase
.from("caixas")
.select("*")
.eq("empresa_id", empresaId)
.is("fechado_em", null)
.single();

if (buscaErro) throw buscaErro;

const { error } = await supabase
.from("caixas")
.update({
valor_fechamento: valorFechamento,
fechado_em: new Date().toISOString(),
})
.eq("id", caixaAberto.id);

if (error) throw error;
return true;
}
