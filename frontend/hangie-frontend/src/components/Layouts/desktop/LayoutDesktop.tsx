import Chats from "@/app/pages/Chats";
import React from "react";
import Sidebar from "../../../app/pages/desktop/Sidebar";
const LayoutDesktop = ({ children }) => {
  return (
    <div className="h-screen w-full flex flex-row">
      <Sidebar />
      <div className="flex flex-col w-full h-full  bg-bg-2">
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20 backdrop-blur-md">
          <div className="mx-auto px-8 py-6 hidden 2xl:block">
            <div className="flex items-center justify-between gap-6 ">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Scopri Eventi
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Trova l'esperienza perfetta per te
                </p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-grow h-screen overflow-y-auto xl:px-10 2xl:px-20  xl:py-6 2xl:py-12">
          {children}
        </main>
      </div>
    </div>
  );
};

export default LayoutDesktop;
