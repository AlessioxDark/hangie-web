import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
export const ScreenContext = createContext({
  currentScreen: null,
});

export const useScreen = () => {
  const context = useContext(ScreenContext);

  // Si può aggiungere un check per assicurarsi che l'hook venga usato all'interno del Provider
  if (context === undefined) {
    throw new Error(
      "useScrenn deve essere usato all'interno di un ScreenProvider"
    );
  }

  return context;
};
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024, // Breakpoint per il layout Desktop
  xl: 1280,
  "2xl": 1536,
};
const calculateBreakPoint = (width) => {
  if (width >= BREAKPOINTS["2xl"]) return "2xl";
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "xs";
};
export const ScreenProvider = ({ children }) => {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [currentScreen, setCurrentScreen] = useState(null);
  const handleResize = useCallback(() => {
    setWidth(window.innerWidth);
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    console.log("resize");

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);
  useEffect(() => {
    if (calculateBreakPoint(width) !== currentScreen) {
      setCurrentScreen(calculateBreakPoint(width));
      // console.log(`Breakpoint cambiato a: ${newName}`); // Utile per il debug
    }
  }, [width, currentScreen]);

  return (
    <ScreenContext.Provider value={{ currentScreen }}>
      {children}
    </ScreenContext.Provider>
  );
};
export default ScreenContext;
