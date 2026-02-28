import LayoutDesktop from "@/components/Layouts/desktop/LayoutDesktop";
import LayoutMobile from "@/components/Layouts/mobile/LayoutMobile";
import ResponsiveLayoutChat from "@/components/Layouts/chats/ResponsiveLayoutChat";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router";
import RenderLoadingState from "@/features/utils/RenderLoadingState";
const ResponsiveLayoutWrapper = ({ children, layoutType = "standard" }) => {
  const { session, isAuthLoading } = useAuth();

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

  return <LayoutMobile>{children}</LayoutMobile>;
};
export default ResponsiveLayoutWrapper;
