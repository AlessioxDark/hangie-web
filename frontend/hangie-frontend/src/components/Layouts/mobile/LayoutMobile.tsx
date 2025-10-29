import BottomNav from '@/app/pages/mobile/BottomNav';
import React from 'react';
const LayoutMobile = ({ children }) => {
	return (
		<div className="h-screen w-full flex flex-col justify-between ">
			<div className="h-[calc(100vh-8rem)]">{children}</div>
			<BottomNav />
		</div>
	);
};

export default LayoutMobile;
