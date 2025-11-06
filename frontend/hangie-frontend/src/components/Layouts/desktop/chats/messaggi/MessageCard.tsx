import React from 'react';

const MessageCard = ({ isUser, content, utenti }) => {
	return (
		<div
			className="bg-bg-3 px-4 py-3 flex flex-col gap-1 rounded-md w-fit 
      max-w-md relative
      
      after:absolute after:-bottom-0.5 after:-left-2 after:w-0 after:h-0 
            after:border-8 after:border-transparent 
            after:border-r-white after:border-t-white 
            after:rotate-[45deg] after:shadow-sm after:border-t-gray-200 after:border-r-gray-200 "
		>
			<span className="text-text-1 font-body font-bold">{utenti.nome}</span>
			<span className="font-body font-regular text-text-1 ">{content}</span>
		</div>
	);
};

export default MessageCard;
