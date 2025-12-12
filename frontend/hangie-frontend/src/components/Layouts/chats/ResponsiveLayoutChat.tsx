import { useScreen } from "@/contexts/ScreenContext";
import React from "react";
import LayoutChatDesktop from "./LayoutChatDesktop";
import LayoutChatMedium from "./LayoutChatMedium";

const ResponsiveLayoutChat = () => {
  const { currentScreen } = useScreen();
  if (currentScreen === "2xl") {
    return <LayoutChatDesktop></LayoutChatDesktop>;
  }
  if (currentScreen == "xl") {
    // return
    return <LayoutChatMedium />;
  } else {
    return <div>ok</div>;
  }
};

export default ResponsiveLayoutChat;
