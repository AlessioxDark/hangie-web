import BottomNav from "@/app/pages/mobile/BottomNav";
import { useNotification } from "@/contexts/NotificationContext";
import { Bell } from "lucide-react";
import React from "react";
import { Link } from "react-router";
const LayoutMobile = ({ children }) => {
  const { currentNotifications } = useNotification();
  return (
    <div className="h-screen w-full flex flex-col justify-between ">
      <div className="">
        <div className="w-full flex items-center flex-row  sticky bg-bg-1 z-30 top-0">
          <header className="flex w-full flex-row justify-between items-center px-4 py-3 border-b border-text-2">
            <div className="flex flex-row gap-4 items-center">
              <div className="bg-primary rounded-xl py-1 px-2.5">
                <span className="font-body text-bg-1 font-black text-3xl">
                  H
                </span>
              </div>
              <h1 className="font-body font-bold text-3xl text-text-1">
                HANGIE
              </h1>
            </div>
            <Link to="/notifications" className="relative">
              {currentNotifications.unread.length > 0 && (
                <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
              )}
              <Bell size={26} />
            </Link>
          </header>
        </div>

        <div className={`${"p-4 pt-2.5 pb-20"}`}>{children}</div>
      </div>
      <BottomNav />
    </div>
  );
};

export default LayoutMobile;
