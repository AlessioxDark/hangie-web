import { House, MessageCircle, Ticket, User } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.svg';
type ValidPath = `/${string}`;
type SidebarLinksType = {
	id: number;
	title: 'Home' | 'Chats' | 'Profilo' | 'Eventi';
	icon: React.ReactNode;
	link: ValidPath;
	description: string;
};
const Sidebar = () => {
	const location = useLocation();

	const sidebarLinks: SidebarLinksType[] = [
		{
			id: 1,
			title: 'Home',
			icon: <House className="w-6 h-6" aria-hidden="true" />,
			link: '/',
			description: 'Scopri nuovi eventi',
		},
		{
			id: 2,
			title: 'Chats',
			icon: <MessageCircle className="w-6 h-6" aria-hidden="true" />,
			link: '/chats',
			description: 'I tuoi messaggi',
		},
		{
			id: 3,
			title: 'Eventi',
			icon: <Ticket className="w-6 h-6" aria-hidden="true" />,
			link: '/events',
			description: 'I tuoi eventi',
		},
		{
			id: 4,
			title: 'Profilo',
			icon: <User className="w-6 h-6" aria-hidden="true" />,
			link: '/profile',
			description: 'Impostazioni account',
		},
	];

	const isLinkActive = (linkPath: ValidPath): boolean => {
		// Gestione più robusta del path attivo
		if (linkPath === '/') {
			return location.pathname === '/';
		}
		return location.pathname.startsWith(linkPath);
	};

	return (
		<aside className="h-full w-1/5 p-6 flex flex-col gap-8 shadow-xl bg-primary">
			<header className="flex w-full flex-row gap-4 items-center py-4">
				<div className="p-2 rounded-2xl bg-white/10 backdrop-blur-sm">
					<img
						src={logo}
						alt="Hangie Logo"
						className="w-15 h-15"
						loading="lazy"
					/>
				</div>
				<h1 className="font-title font-bold text-3xl text-white">Hangie</h1>
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
								flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group text-white
								focus:outline-none focus:ring-2 focus:ring-white/50
								${
									isActive
										? 'shadow-lg transform scale-105 bg-accent'
										: 'hover:transform hover:scale-105 hover:shadow-md bg-white/10 hover:bg-white/20'
								} 
							`}
							aria-label={link.description}
							aria-current={isActive ? 'page' : undefined}
						>
							<div
								className={`transition-transform duration-300 ${
									isActive ? 'scale-110' : 'group-hover:scale-110'
								}`}
							>
								{link.icon}
							</div>
							<span className="font-title text-lg font-medium">
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
