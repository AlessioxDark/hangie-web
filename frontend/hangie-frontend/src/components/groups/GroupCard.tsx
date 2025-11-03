import React from 'react';

const GroupCard = ({ nome, group_cover_img }) => {
	return (
		<div className="bg-bg-2 p-3 flex flex-row items-center">
			<img src={group_cover_img} className="h-9 w-9" alt="" />
			<h1 className="font-bold font-body text-xl">{nome}</h1>
			{/* <p>vsd</p> */}
		</div>
	);
};

export default GroupCard;
