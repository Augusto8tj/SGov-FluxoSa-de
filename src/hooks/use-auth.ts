
"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

/**
 * @fileOverview Hook customizado para gerenciar o estado de autenticação.
 * Corrigido para ser seguro durante a hidratação (Hydration Safe), garantindo
 * que o estado inicial no servidor coincida com o do cliente.
 */

export function useAuth() {
  // Estado inicial consistente: no servidor e no primeiro render do cliente, começamos com loading: true
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificação de sessão (Demo ou Firebase) ocorre apenas após a montagem no cliente
    const checkAuth = () => {
      const demoUser = sessionStorage.getItem("sgov_demo_user");
      if (demoUser) {
        setUser(JSON.parse(demoUser));
        setLoading(false);
        return;
      }

      // Monitoramento do Firebase Auth real
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        setUser(fbUser || null);
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribe = checkAuth();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      sessionStorage.removeItem("sgov_demo_user");
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };

  return { user, loading, logout };
}
