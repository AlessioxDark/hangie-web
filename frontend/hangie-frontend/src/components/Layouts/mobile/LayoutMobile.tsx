import BottomNav from '@/app/pages/mobile/BottomNav';
import React from 'react';
const LayoutMobile = ({ children }) => {
	return (
		<div className="h-screen w-full flex flex-col justify-between ">
			<div className="">
				<div className="w-full flex items-center flex-row  sticky bg-bg-1 z-30 top-0">
					<header className="flex w-full flex-row gap-4 items-center  p-6 border-b border-text-2">
						<div className="bg-primary rounded-2xl py-2 px-4">
							<span className="font-body text-bg-1 font-black text-5xl">H</span>
						</div>
						<h1 className="font-body font-bold text-4xl text-text-1">HANGIE</h1>
					</header>
				</div>
				<div className="p-6">{children}</div>
			</div>
			<BottomNav />
		</div>
	);
};

export default LayoutMobile;
