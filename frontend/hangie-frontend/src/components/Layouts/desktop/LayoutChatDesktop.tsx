import ChatsSidebar from '@/app/pages/ChatsSidebar';
import Sidebar from '@/app/pages/desktop/Sidebar';

import React from 'react';
const LayoutChatDesktop = ({ children }) => {
	return (
		<div className="h-screen w-full flex flex-row">
			<Sidebar />
			<ChatsSidebar />
			<div className="flex flex-col w-full h-screen  bg-bg-2">
				<main className="flex-grow h-screen overflow-y-auto px-20 py-12">
					{children}
				</main>
			</div>
			{/* {children} */}
		</div>
	);
};

export default LayoutChatDesktop;
