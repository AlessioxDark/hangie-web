import React from 'react';
import Sidebar from '../../../app/pages/desktop/Sidebar';

const LayoutDesktop = ({ children }) => {
	return (
		<div className="h-screen w-full flex flex-row">
			<Sidebar />
			<main className="flex-grow h-screen overflow-y-auto">{children}</main>
			{/* {children} */}
		</div>
	);
};

export default LayoutDesktop;
