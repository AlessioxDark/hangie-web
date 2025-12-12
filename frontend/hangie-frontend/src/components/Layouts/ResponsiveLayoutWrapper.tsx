import LayoutDesktop from "@/components/Layouts/desktop/LayoutDesktop";
import LayoutMobile from "@/components/Layouts/mobile/LayoutMobile";
import ResponsiveLayoutChat from "@/components/Layouts/chats/ResponsiveLayoutChat";
import { useScreen } from "@/contexts/ScreenContext";
import { useEffect, useState } from "react";
const ResponsiveLayoutWrapper = ({ children, layoutType = "standard" }) => {
  // L'hook è chiamato correttamente qui, al top-level del componente wrapper.
  // const isDesktop = useMediaQuery("(min-width: 1280px)");
  // console.log(isDesktop);
  const { currentScreen } = useScreen();
  const [isDesktop, setisDesktop] = useState(null);

  useEffect(() => {
    if (currentScreen == "xl" || currentScreen == "2xl") {
      setisDesktop(true);
    } else {
      setisDesktop(false);
    }
  }, [currentScreen]);
  // Se desktop, usa il LayoutDesktop
  if (layoutType == "chat") {
    return <ResponsiveLayoutChat />;
  }
  if (isDesktop && layoutType !== "chat") {
    return <LayoutDesktop>{children}</LayoutDesktop>;
  }

  // Se mobile, usa il LayoutMobile
  return <LayoutMobile>{children}</LayoutMobile>;
};
export default ResponsiveLayoutWrapper;
