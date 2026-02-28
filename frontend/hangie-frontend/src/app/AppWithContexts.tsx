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
        {/* Schermata di blocco per Desktop */}
        <div className=" flex flex-col items-center justify-center min-h-screen bg-bg-1 text-white p-6 text-center select-none">
          {/* Cerchio estetico per il logo */}
          {/* <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-4xl mb-8 shadow-2xl shadow-blue-500/20 animate-pulse">
            📱
          </div> */}
          <div className="bg-primary rounded-xl w-20 h-20 flex justify-center items-center mb-8">
            <span className="font-body text-bg-1 font-black text-5xl">H</span>
          </div>
          {/* Testo Principale */}
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

          {/* Info per i Recruiter/Dev */}
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

          {/* Link Demo */}
          {/* <a
            href="#link-al-video"
            className="group flex items-center gap-2 text-zinc-500 transition-all duration-300"
          >
            <span className="text-sm font-medium uppercase tracking-widest text-zinc-400 ">
              Guarda la Video Demo
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a> */}
        </div>
      </>
    );
    // return <LayoutDesktop>{children}</LayoutDesktop>;
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
