import ResponsiveLayoutWrapper from "@/components/Layouts/ResponsiveLayoutWrapper";
import React from "react";
import { Route, Routes, useLocation } from "react-router";
import EventsSuspended from "./pages/EventsSuspended";
import EventDetailsMobile from "@/features/events/EventDetailsMobile";
import Login from "./pages/desktop/Login";
import SignUp from "./pages/desktop/SignUp";
import Notification from "./pages/Notification";
import Home from "./pages/Home";
import ModalHandler from "@/features/modal/ModalHandler";
import EventDetailsModal from "@/features/modal/EventDetailsModal";
import EventDetailsParticipants from "@/features/events/EventDetailsParticipants";
const AppRouter = () => {
  const location = useLocation();
  const background = location.state && location.state.backgroundLocation;
  return (
    <>
      <Routes location={background || location}>
        <Route path="/signup" element={<SignUp />}></Route>
        <Route path="/login" element={<Login />}></Route>
        {!background && (
          <>
            <Route
              path="/events/:eventId"
              element={<EventDetailsMobile />}
            ></Route>
            <Route
              path="/events/:eventId/participants"
              element={<EventDetailsParticipants />}
            ></Route>
          </>
        )}
        <Route
          path="/notifications"
          element={
            <ResponsiveLayoutWrapper>
              <Notification />
            </ResponsiveLayoutWrapper>
          }
        ></Route>
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
      {background && (
        <Routes>
          <Route path="/events/:eventId" element={<EventDetailsModal />} />
        </Routes>
      )}
      <ModalHandler />
    </>
  );
};

export default AppRouter;
