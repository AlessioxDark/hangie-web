import BottomNav from "@/app/pages/mobile/BottomNav";
import { useLocation } from "react-router";
const LayoutMobile = ({ children }) => {
  const location = useLocation();
  return (
    <div className="h-screen w-full flex flex-col justify-between ">
      {location.pathname == "/" ? (
        <div className="">
          <div className="w-full flex items-center flex-row  sticky bg-bg-1 z-30 top-0">
            <header className="flex w-full flex-row justify-between items-center px-4 py-3 border-b border-neutral-300">
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
            </header>
          </div>

          <div className={`${"p-4 pt-2.5 pb-20"}`}>{children}</div>
        </div>
      ) : (
        <div className={`${"p-4 pt-2.5 pb-20"}`}>{children}</div>
      )}
      <BottomNav />
    </div>
  );
};

export default LayoutMobile;
