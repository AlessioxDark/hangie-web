import LayoutDesktop from "@/components/Layouts/desktop/LayoutDesktop";
import LayoutMobile from "@/components/Layouts/mobile/LayoutMobile";
import ResponsiveLayoutChat from "@/components/Layouts/chats/ResponsiveLayoutChat";
import { useScreen } from "@/contexts/ScreenContext";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router";
import RenderLoadingState from "@/features/utils/RenderLoadingState";
const ResponsiveLayoutWrapper = ({ children, layoutType = "standard" }) => {
  const { currentScreen } = useScreen();
  const [isDesktop, setisDesktop] = useState(null);
  const { session, isAuthLoading } = useAuth();

  useEffect(() => {
    if (currentScreen == "xl" || currentScreen == "2xl") {
      setisDesktop(true);
    } else {
      setisDesktop(false);
    }
  }, [currentScreen]);

  if (isAuthLoading) {
    return <RenderLoadingState type="friends" />;
  }
  if (!session) {
    return <Navigate to="/login" replace />;
  }
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
