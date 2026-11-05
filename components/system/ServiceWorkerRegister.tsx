"use client";

import { useEffect } from "react";

/** Registruoja naršyklės lygio spartinančią talpyklą (public/sw.js) – tik produkcijoje. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        /* talpykla neprivaloma – svetainė veikia ir be jos */
      });
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);
  return null;
}
