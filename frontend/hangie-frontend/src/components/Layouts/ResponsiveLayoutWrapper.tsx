import LayoutDesktop from "@/components/Layouts/desktop/LayoutDesktop";
import LayoutMobile from "@/components/Layouts/mobile/LayoutMobile";
import ResponsiveLayoutChat from "@/components/Layouts/chats/ResponsiveLayoutChat";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router";
import RenderLoadingState from "@/features/utils/RenderLoadingState";
const ResponsiveLayoutWrapper = ({ children, layoutType = "standard" }) => {
  const { session } = useAuth();
  console.log("ecco session", session);
  if (!session) {
    console.log("ti rimando al login");
    return <Navigate to="/login" replace />;
  }
  // Se desktop, usa il LayoutDesktop
  if (layoutType == "chat") {
    return <ResponsiveLayoutChat />;
  }

  return <LayoutMobile>{children}</LayoutMobile>;
};
export default ResponsiveLayoutWrapper;
