import { Calendar } from 'lucide-react';
import React from 'react';

const RenderEmptyState = () => {
	return (
		<div className="flex flex-col items-center justify-center py-20 px-4 w-full ">
			<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
				<Calendar className="w-8 h-8 text-gray-400" />
			</div>

			<h3 className="text-lg font-medium text-gray-900 mb-2">
				Nessun Evento per il momento
			</h3>
		</div>
	);
};

export default RenderEmptyState;
