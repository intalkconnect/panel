import { useEffect, useState } from "react";
import { supabase } from "../data/supabaseClient";

export function useUser() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const session = supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                carregarPerfil(session.user);
            } else {
                setLoading(false);
            }
        });

        const { data: listener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (session?.user) {
                    carregarPerfil(session.user);
                } else {
                    setUser(null);
                }
            }
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const carregarPerfil = async (userInfo) => {
        const { data: perfil } = await supabase
            .from("perfis")
            .select("*")
            .eq("id", userInfo.id)
            .single();

        setUser({ ...userInfo, ...perfil });
        setLoading(false);
    };

    return { user, loading };
}
