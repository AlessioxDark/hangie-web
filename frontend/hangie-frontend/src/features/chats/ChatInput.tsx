import SendIcon from '@/assets/icons/SendIcon';

const ChatInput = ({ chatInputRef, setChatInput, sendMessage }) => {
	return (
		<div
			className="
            bg-white border-t border-gray-200
                    flex items-center justify-center 
                    p-4 shadow-2xl 
        "
			style={{ borderWidth: '0.1px', borderLeft: '0px' }}
		>
			{/* Contenitore Input Interno */}
			<div className="flex flex-row w-full max-w-4xl gap-4 items-center">
				<div
					className="
          bg-gray-100 flex-1 
                            rounded-4xl 
                            focus-within:ring-2 
                            focus-within:ring-blue-500
                            p-2 shadow-inner transition-shadow
                            flex items-center
                            
                            
          "
				>
					<div>cp</div>
					<div
						contentEditable={true}
						ref={chatInputRef}
						className={`
                min-h-10 max-h-32
                whitespace-pre-wrap
                w-full p-2  outline-none font-body text-lg text-text-1 items-start overflow-y-auto
             
                `}
						onInput={(e) => {
							setChatInput(e.target.textContent);
							if (!e.target.textContent) {
								e.currentTarget.innerHTML = '';
							}
						}}
						onKeyDown={(e) => {
							if (e.key == 'Enter') {
								e.preventDefault();
								sendMessage();
							}
						}}
						data-placeholder="Scrivi un messaggio..."
					></div>
				</div>
				<div onClick={sendMessage}>
					<SendIcon />
				</div>
			</div>
		</div>
	);
};

export default ChatInput;
