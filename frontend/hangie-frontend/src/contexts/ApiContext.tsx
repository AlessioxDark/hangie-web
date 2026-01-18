import React, { createContext, useCallback, useContext, useState } from "react";
export const ApiContext = createContext({
  executeApiCall: (arg, arg2, arg3) => {},
  loading: {},
  error: {},
});

export const useApi = () => {
  const context = useContext(ApiContext);

  // Si può aggiungere un check per assicurarsi che l'hook venga usato all'interno del Provider
  if (context === undefined) {
    throw new Error("useChat deve essere usato all'interno di un ChatProvider");
  }

  return context;
};
export const ApiContextProvider = ({ children }) => {
  const [loading, setLoading] = useState({
    chat: false,
    home: false,
    groups: false,
    events: false,
    home_events: false,
    add_event: false,
  });
  const [error, setError] = useState({
    chat: null,
    home: null,
    groups: null,
    events: null,
    home_events: null,
    add_event: null,
  });

  const executeApiCall = useCallback(
    async (
      type: "chat" | "groups" | "events" | "home" | "home_events" | "add_event",
      fetchCall,
      onSuccess,
    ) => {
      // if (loading[type]) return;

      try {
        setError((prev) => ({ ...prev, [type]: null }));
        setLoading((prev) => {
          return { ...prev, [type]: true };
        });
        const data = await fetchCall();
        onSuccess(data);
      } catch (err: any) {
        setError((prev) => {
          return {
            ...prev,
            [type]: {
              message: err.message || "Errore di connessione",
              status: err.status || 500,
              at: Date.now(),
              details: err.details,
            },
          };
        });
      } finally {
        setLoading((prev) => {
          return { ...prev, [type]: false };
        });
      }
    },
    [],
  );
  return (
    <ApiContext.Provider value={{ loading, error, executeApiCall }}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext;
