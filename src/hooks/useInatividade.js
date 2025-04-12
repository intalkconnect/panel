import { useEffect, useRef } from "react";

/**
 * Hook que detecta inatividade do usuário e executa um callback.
 *
 * @param {boolean} ativo - Se a inatividade deve ser monitorada.
 * @param {any} dependente - Qualquer valor ou estado que deve reiniciar o timer (ex: carrinho).
 * @param {Function} onInativo - Função executada após o tempo limite.
 * @param {number} tempoMs - Tempo de inatividade em milissegundos.
 */
export function useInatividade(ativo, dependente, onInativo, tempoMs = 120000) {
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (!ativo) return;

        const resetTimer = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(onInativo, tempoMs);
        };

        resetTimer();

        const eventos = ["click", "mousemove", "keydown", "touchstart"];
        eventos.forEach((e) => window.addEventListener(e, resetTimer));

        return () => {
            eventos.forEach((e) => window.removeEventListener(e, resetTimer));
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [ativo, JSON.stringify(dependente)]);
}
