"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

/**
 * @fileOverview Hook customizado para gerenciar o estado de autenticação.
 * Otimizado para evitar flashes de "loading" durante a navegação em modo demo.
 */

// Função auxiliar para pegar o usuário inicial sem delay
const getInitialUser = () => {
  if (typeof window === "undefined") return null;
  const demoUser = sessionStorage.getItem("sgov_demo_user");
  return demoUser ? JSON.parse(demoUser) : null;
};

export function useAuth() {
  const [user, setUser] = useState<any | null>(getInitialUser());
  // Se já temos um usuário demo, começamos com loading: false
  const [loading, setLoading] = useState(!getInitialUser());
  const router = useRouter();

  useEffect(() => {
    // Se for usuário demo, o estado inicial já resolveu
    const demoUser = sessionStorage.getItem("sgov_demo_user");
    if (demoUser) {
      if (!user) setUser(JSON.parse(demoUser));
      setLoading(false);
      return;
    }

    // Monitoramento do Firebase Auth real
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

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
