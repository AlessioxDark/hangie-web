import { useScreen } from "@/contexts/ScreenContext";
import React from "react";
import LayoutChatDesktop from "./LayoutChatDesktop";
import LayoutChatMedium from "./LayoutChatMedium";
import LayoutChatMobile from "./LayoutChatMobile";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router";

const ResponsiveLayoutChat = () => {
  const { currentScreen } = useScreen();
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/login" replace />;
  }
  if (currentScreen === "2xl") {
    return <LayoutChatDesktop></LayoutChatDesktop>;
  }
  if (currentScreen == "xl") {
    return <LayoutChatMedium />;
  }

  if (currentScreen == "xs") {
    return <LayoutChatMobile />;
  }
};

export default ResponsiveLayoutChat;
