import LayoutChatDesktop from "@/components/Layouts/desktop/chats/LayoutChatDesktop";
import LayoutDesktop from "@/components/Layouts/desktop/LayoutDesktop";
import LayoutMobile from "@/components/Layouts/mobile/LayoutMobile";
import { useScreen } from "@/contexts/ScreenContext";
import useMediaQuery from "@/hooks/IsDekstop";
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
  if (isDesktop) {
    if (layoutType == "chat") {
      return <LayoutChatDesktop></LayoutChatDesktop>;
    }
    return <LayoutDesktop>{children}</LayoutDesktop>;
  }

  // Se mobile, usa il LayoutMobile
  return <LayoutMobile>{children}</LayoutMobile>;
};
export default ResponsiveLayoutWrapper;
