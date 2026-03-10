import { useProfile } from "@/contexts/ProfileContext";
import SidebarIcons from "@/utils/SidebarIcons";
import React from "react";
import { Link } from "react-router-dom";

const BottomNav = () => {
  type ValidPath = `/${string}`;
  const { defaultHandle } = useProfile();
  const isLinkActive = (linkPath: ValidPath): boolean => {
    // Gestione più robusta del path attivo
    if (linkPath === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(linkPath);
  };
  type SidebarLinksType = {
    id: number;
    title: "Home" | "Chats" | "Profilo" | "Amici";
    link: ValidPath;
    description: string;
  };
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
      link: "/friends",
      description: "I tuoi eventi",
    },
    {
      id: 4,
      title: "Profilo",
      link: `/profile/${defaultHandle}`,
      description: "Impostazioni account",
    },
  ];
  return (
    // bottom-0 fixed
    <div
      className=" 
   min-h-16 max-h-16
    w-full  bottom-0 h-16 border-t border-neutral-300 bg-bg-1 flex flex-row  items-center justify-around"
    >
      {sidebarLinks.map((link) => {
        const isActive = isLinkActive(link.link);

        return (
          <Link
            to={link.link}
            key={link.id}
            className={`
								flex items-center flex-col  gap-2.5 ${
                  isActive ? " text-primary  " : " text-text-2 bg-bg-1 "
                } 
							`}
            aria-label={link.description}
            aria-current={isActive ? "page" : undefined}
          >
            <SidebarIcons isActive={isActive} title={link.title} />

            <span className="font-body font-medium text-base leading-2 ">
              {link.title}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNav;
