import React, { createContext, useContext, useEffect, useState } from "react";

export const MobileLayoutChatContext = createContext({
  mobileView: null,
  setMobileView: (arg) => arg,
});
export const useMobileLayoutChat = () => {
  const context = useContext(MobileLayoutChatContext);

  // Si può aggiungere un check per assicurarsi che l'hook venga usato all'interno del Provider
  if (context === undefined) {
    throw new Error("useChat deve essere usato all'interno di un ChatProvider");
  }

  return context;
};
export const MobileLayoutChatProvider = ({ children }) => {
  const [mobileView, setMobileView] = useState<"groups" | "chat" | "events">(
    "groups"
  );

  return (
    <MobileLayoutChatContext.Provider value={{ mobileView, setMobileView }}>
      {children}
    </MobileLayoutChatContext.Provider>
  );
};
export default MobileLayoutChatContext;
