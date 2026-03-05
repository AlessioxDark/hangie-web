import { ApiContextProvider } from "@/contexts/ApiContext";
import { AuthContextProvider, useAuth } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { FriendsProvider } from "@/contexts/FriendsContext";
import { ModalProvider } from "@/contexts/ModalContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { SocketProvider } from "@/contexts/SocketContext";
import React from "react";
import { BrowserRouter, Navigate } from "react-router";
import AppRouter from "./AppRouter";
import { useScreen } from "@/contexts/ScreenContext";
import { MobileLayoutChatProvider } from "@/contexts/MobileLayoutChatContext";
import RenderLoadingState from "@/features/utils/RenderLoadingState";

const AppWithContexts = () => {
  const { currentScreen } = useScreen();
  const { session, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <RenderLoadingState type="home" />;
  }

  if (!currentScreen) {
    return <RenderLoadingState type={"home"} />;
  }
  if (currentScreen !== "xs") {
    return (
      <>
        <div className=" flex flex-col items-center justify-center min-h-screen bg-bg-1 text-white p-6 text-center select-none">
          <div className="bg-primary rounded-xl w-20 h-20 flex justify-center items-center mb-8">
            <span className="font-body text-bg-1 font-black text-5xl">H</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-4 text-text-1">
            Hangie{" "}
            <span className="text-gray-500 text-2xl font-light">
              / Mobile-Only
            </span>
          </h1>

          <p className="max-w-md text-text-2 text-lg leading-relaxed mb-10">
            Questa applicazione è stata ingegnerizzata esclusivamente per
            dispositivi mobili per ottimizzare l'esperienza dell'app
          </p>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8 w-full max-w-sm">
            <p className="text-xs text-blue-500 font-mono mb-3 uppercase tracking-widest">
              Developer Access
            </p>
            <p className="text-zinc-400 text-sm leading-6">
              Apri{" "}
              <kbd className="bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded border border-zinc-700 shadow-sm">
                F12
              </kbd>{" "}
              e attiva la <br />
              <span className="text-white font-medium italic">
                Mobile Simulation
              </span>{" "}
              per testare l'app.
            </p>
          </div>
        </div>
      </>
    );
  }
  return (
    <ApiContextProvider>
      <ChatProvider>
        <MobileLayoutChatProvider>
          <FriendsProvider>
            <ProfileProvider>
              <SocketProvider>
                <NotificationProvider>
                  <ModalProvider>
                    <AppRouter />
                  </ModalProvider>
                </NotificationProvider>
              </SocketProvider>
            </ProfileProvider>
          </FriendsProvider>
        </MobileLayoutChatProvider>
      </ChatProvider>
    </ApiContextProvider>
  );
};

export default AppWithContexts;
