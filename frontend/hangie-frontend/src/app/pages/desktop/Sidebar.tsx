import SidebarIcons from "@/utils/SidebarIcons";
import React from "react";
import { Link, useLocation } from "react-router-dom";
/** */
type ValidPath = `/${string}`;
type SidebarLinksType = {
  id: number;
  title: "Home" | "Chats" | "Profilo" | "Amici";
  link: ValidPath;
  description: string;
};
const Sidebar = () => {
  const location = useLocation();

  const sidebarLinks: SidebarLinksType[] = [
    {
      id: 1,
      title: "Home",
      link: "/",
      description: "Scopri nuovi eventi",
    },
    {
      id: 2,
      title: "Chats",

      link: "/chats",
      description: "I tuoi messaggi",
    },
    {
      id: 3,
      title: "Amici",
      link: "/Friends",
      description: "I tuoi eventi",
    },
    {
      id: 4,
      title: "Profilo",
      link: "/profile",
      description: "Impostazioni account",
    },
  ];

  const isLinkActive = (linkPath: ValidPath): boolean => {
    // Gestione più robusta del path attivo
    if (linkPath === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(linkPath);
  };

  return (
    <aside className="xl:h-full  xl:p-6 flex flex-col 2xl:gap-28 shadow-xl bg-bg-1 sticky z-20  top-10">
      <header className="flex w-full flex-row gap-4 items-center py-4">
        <div className="hidden 2xl:block">
          {/* <img
						src={logo}
						alt="Hangie Logo"
						className="w-15 h-15"
						loading="lazy"
					/> */}
          <div className="bg-primary rounded-2xl py-2 px-4">
            <span className="font-body text-bg-1 font-black text-5xl">H</span>
          </div>
        </div>
        <h1 className="font-body font-bold text-4xl text-text-1 hidden 2xl:block">
          HANGIE
        </h1>
      </header>

      {/* Navigation */}
      <nav
        className="flex flex-col gap-3"
        role="navigation"
        aria-label="Menu principale"
      >
        {sidebarLinks.map((link) => {
          const isActive = isLinkActive(link.link);

          return (
            <Link
              to={link.link}
              key={link.id}
              className={`
								flex items-center gap-3 px-3 py-4 rounded-xl transition-all duration-300 group font-medium
								focus:outline-none focus:ring-2 focus:ring-white/50 flex-col 2xl:flex-row
                justify-center xl:gap-1
								${
                  isActive
                    ? "bg-[#D9EAFF] text-primary hover:bg-[#D9EAFF] "
                    : "hover:transform  text-text-2 bg-bg-1 hover:bg-[#F1F4F8]"
                } 
							`}
              aria-label={link.description}
              aria-current={isActive ? "page" : undefined}
            >
              <div>
                <SidebarIcons isActive={isActive} title={link.title} />
              </div>
              <span className="font-body font-medium text-xl">
                {link.title}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
