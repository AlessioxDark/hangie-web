import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/desktop/Login";
import SignUp from "./pages/desktop/SignUp";

import { ChatProvider } from "@/contexts/ChatContext";
import LayoutChatDesktop from "@/components/Layouts/chats/LayoutChatDesktop";
import EventDetailsModal from "@/features/modal/EventDetailsModal";
import ModalHandler from "@/features/modal/ModalHandler";
import { AuthContextProvider } from "../contexts/AuthContext";
import { ModalContext, ModalProvider } from "../contexts/ModalContext";
import Chats from "./pages/Chats";
import EventsSuspended from "./pages/EventsSuspended";
import Home from "./pages/Home";
import ResponsiveLayoutWrapper from "../components/Layouts/ResponsiveLayoutWrapper";
import { ScreenProvider } from "@/contexts/ScreenContext";
import { MobileLayoutChatProvider } from "@/contexts/MobileLayoutChatContext";
import { SocketProvider } from "@/contexts/SocketContext";
// import { NotificationProvider } from "@/contexts/NotificationContext";
function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <ChatProvider>
          <SocketProvider>
            {/* <NotificationProvider> */}
            <ScreenProvider>
              <ModalProvider>
                <Routes>
                  <Route path="/signup" element={<SignUp />}></Route>
                  <Route path="/login" element={<Login />}></Route>
                  <Route
                    path="/chats"
                    element={
                      <ResponsiveLayoutWrapper layoutType="chat"></ResponsiveLayoutWrapper>
                    }
                  ></Route>

                  <Route
                    path="/"
                    element={
                      <ResponsiveLayoutWrapper>
                        <Home />
                      </ResponsiveLayoutWrapper>
                    }
                  />
                  <Route
                    path="/events/suspended/all"
                    element={
                      <ResponsiveLayoutWrapper>
                        <EventsSuspended />
                      </ResponsiveLayoutWrapper>
                    }
                  />
                </Routes>
                <ModalHandler />
              </ModalProvider>
            </ScreenProvider>
            {/* </NotificationProvider> */}
          </SocketProvider>
        </ChatProvider>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
