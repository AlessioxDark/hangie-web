import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
export const MobileLayoutContext = createContext({
  mobileView: null,
  setMobileView: (arg) => arg,
});

export const useMobileLayout = () => {
  const context = useContext(MobileLayoutContext);

  // Si può aggiungere un check per assicurarsi che l'hook venga usato all'interno del Provider
  if (context === undefined) {
    throw new Error(
      "useScrenn deve essere usato all'interno di un ScreenProvider",
    );
  }

  return context;
};

export const MobileLayoutChatProvider = ({ children }) => {
  const [mobileView, setMobileView] = useState("groups");

  return (
    <MobileLayoutContext.Provider value={{ mobileView, setMobileView }}>
      {children}
    </MobileLayoutContext.Provider>
  );
};
