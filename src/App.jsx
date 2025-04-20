import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { isMobile } from "react-device-detect";

import { useInatividade } from "./hooks/useInatividade";
import { carregarDados } from "./utils/api";
import { salvarPedido } from "./utils/pedido";

import {
  TelaInicial,
  NomeCliente,
  ModoConsumo,
  EscolherMesa,
  ConfirmarPedido,
  Pagamento,
  AguardandoPagamento,
} from "./components/telas";

import LayoutPrincipal from "./components/layout/LayoutPrincipal";

function App() {
  const { encoded } = useParams();
  const [empresaId, setEmpresaId] = useState(null);
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [instance, setInstance] = useState(null);

  const [empresa, setEmpresa] = useState(null);
  const [iniciarTela, setIniciarTela] = useState(false);
  const [loading, setLoading] = useState(false);

  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [carrinho, setCarrinho] = useState([]);

  const [modoConsumo, setModoConsumo] = useState(null);
  const [mesaSelecionada, setMesaSelecionada] = useState(null);
  const [nomeCliente, setNomeCliente] = useState("");
  const [solicitandoNome, setSolicitandoNome] = useState(false);
  const [escolhendoMesa, setEscolhendoMesa] = useState(false);

  const [confirmarPedido, setConfirmarPedido] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState(null);
  const [aguardandoPagamento, setAguardandoPagamento] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  useEffect(() => {
    if (encoded) {
      // é um pedido via link com telefone (Delivery)
      const decoded = atob(encoded);
      const [empresa, whatsappId, instance] = decoded.split(":");
      setEmpresaId(empresa);
      setTelefoneCliente(whatsappId || "");
      setInstance(instance);
      setSolicitandoNome(true);
      setModoConsumo("Delivery");
    }
  }, [encoded]);

  useEffect(() => {
    // Carrega apenas o nome da empresa se ainda não estiver carregado
    if (!empresa && empresaId) {
      carregarDados(empresaId).then(({ empresa }) => {
        setEmpresa(empresa);
      });
    }
  }, [empresaId]);

  // ⏳ Reseta após tempo de inatividade
  useInatividade(
    iniciarTela,
    carrinho, // sem colchetes
    () => {
      setIniciarTela(false);
      setModoConsumo(null);
      setCarrinho([]);
      setConfirmarPedido(false);
      setFormaPagamento(null);
      setAguardandoPagamento(false);
      setEscolhendoMesa(false);
      setMesaSelecionada(null);
    },
    empresa?.tempo_inatividade_ms
  );

  useEffect(() => {
    if (!iniciarTela) return;

    setLoading(true);
    carregarDados(empresaId)
      .then(({ empresa, categorias, produtos }) => {
        setEmpresa(empresa);
        setCategorias(categorias);
        setProdutos(produtos);
        setCategoriaSelecionada(categorias[0]?.id || null);

        // Se for mobile, já define o modo de consumo e pula telas
        if (isMobile) {
          setModoConsumo("Delivery"); // ou "Delivery" se quiser renomear
          setSolicitandoNome(true); // ainda pede o nome
        }
      })
      .finally(() => setLoading(false));
  }, [iniciarTela]);

  useEffect(() => {
    if (
      ["Pix", "Débito", "Crédito"].includes(formaPagamento) &&
      !aguardandoPagamento
    ) {
      setTimeout(() => setAguardandoPagamento(true), 300);
    }
  }, [formaPagamento]);

  useEffect(() => {
    if (aguardandoPagamento) {
      salvarPedido({
        empresaId,
        nomeCliente,
        modoConsumo,
        mesaSelecionada,
        formaPagamento,
        carrinho,
        total: carrinho.reduce(
          (acc, item) => acc + item.preco * item.quantidade,
          0
        ),
      });
    }
  }, [aguardandoPagamento]);

  const motionFade = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  };
console.log(phoneNumber);
  return (
    <AnimatePresence mode="wait">
      {!iniciarTela ? (
        <motion.div key="inicio" {...motionFade}>
          <TelaInicial
            onIniciar={() => setIniciarTela(true)}
            empresa={empresa}
          />
        </motion.div>
      ) : loading ? (
        <motion.div key="loading" {...motionFade}>
          <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
            {/* Spinner */}

            <svg
              className="animate-spin h-16 w-16 text-red-600"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        </motion.div>
      ) : solicitandoNome ? (
        <motion.div key="nome" {...motionFade}>
          <NomeCliente
            nome={nomeCliente}
            onChange={setNomeCliente}
            onConfirmar={() => {
              setSolicitandoNome(false);
            }}
          />
        </motion.div>
      ) : !modoConsumo ? (
        <motion.div key="modo" {...motionFade}>
          <div className="min-h-screen flex items-center justify-center bg-white px-4">
            <div className="w-full max-w-md">
              {escolhendoMesa ? (
                <EscolherMesa
                  onSelecionarMesa={(mesa) => {
                    setMesaSelecionada(mesa);
                    setModoConsumo("Comer aqui");
                  }}
                />
              ) : (
                <ModoConsumo
                  onComerAqui={() => setEscolhendoMesa(true)}
                  onParaLevar={() => setSolicitandoNome(true)}
                />
              )}
            </div>
          </div>
        </motion.div>
      ) : confirmarPedido && !formaPagamento ? (
        <motion.div key="confirmar" {...motionFade}>
          <ConfirmarPedido
            carrinho={carrinho}
            total={carrinho.reduce(
              (acc, item) => acc + item.preco * item.quantidade,
              0
            )}
            onVoltar={() => setConfirmarPedido(false)}
            onContinuar={() => setFormaPagamento("escolher")}
            modoConsumo={modoConsumo}
            nomeCliente={nomeCliente}
            empresaId={empresaId}
            whatsappId={telefoneCliente}
            instance={instance}
          />
        </motion.div>
      ) : formaPagamento === "escolher" ? (
        <motion.div key="pagamento" {...motionFade}>
          <Pagamento onEscolherForma={setFormaPagamento} />
        </motion.div>
      ) : aguardandoPagamento ? (
        <motion.div key="aguardando" {...motionFade}>
          <AguardandoPagamento forma={formaPagamento} />
        </motion.div>
      ) : (
        <motion.div key="principal" {...motionFade}>
          <LayoutPrincipal
            empresa={empresa}
            categorias={categorias}
            produtos={produtos}
            categoriaSelecionada={categoriaSelecionada}
            setCategoriaSelecionada={setCategoriaSelecionada}
            carrinho={carrinho}
            setCarrinho={setCarrinho}
            modoConsumo={modoConsumo}
            mesaSelecionada={mesaSelecionada}
            nomeCliente={nomeCliente}
            finalizarPedido={() => setConfirmarPedido(true)}
            cancelarPedido={() => {
              setShowConfirmCancel(false);
              setCarrinho([]);
              setIniciarTela(false);
              setModoConsumo(null);
              setMesaSelecionada(null);
            }}
            showConfirmCancel={showConfirmCancel}
            setShowConfirmCancel={setShowConfirmCancel}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
