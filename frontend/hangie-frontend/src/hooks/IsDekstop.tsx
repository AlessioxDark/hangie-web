import { useEffect, useState } from "react";

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false; // Valore di fallback lato server (SSR)
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return; // Non eseguire nulla se non siamo nel browser
    }

    // Inizializza l'oggetto media query
    const media = window.matchMedia(query);

    // Funzione listener che aggiorna lo stato
    const listener = (event) => setMatches(event.matches);

    // Aggiungi il listener per i cambiamenti di stato
    // Nota: usiamo .addListener e .removeListener per una migliore compatibilità con browser più vecchi
    // Se usi solo browser moderni, puoi usare addEventListener/removeEventListener
    media.addEventListener("change", listener);
    matches;
    // ✅ CLEANUP: Rimuove il listener quando il componente viene smontato
    return () => media.removeEventListener("change", listener);

    // ✅ DIPENDENZE: L'effetto deve dipendere SOLO dalla 'query'.
    // Non deve dipendere da 'matches'.
    // Lo stato viene aggiornato solo dal listener.
  }, [query]);

  // Restituisce solo lo stato booleano
  return matches;
};

export default useMediaQuery;
