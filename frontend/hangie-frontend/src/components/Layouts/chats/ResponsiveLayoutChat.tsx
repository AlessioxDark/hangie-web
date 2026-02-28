import { useScreen } from "@/contexts/ScreenContext";
import React from "react";
import LayoutChatDesktop from "./LayoutChatDesktop";
import LayoutChatMedium from "./LayoutChatMedium";
import LayoutChatMobile from "./LayoutChatMobile";

const ResponsiveLayoutChat = () => {
  const { currentScreen } = useScreen();
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
