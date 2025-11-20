import React from 'react';
import ProfileIcon from '../ProfileIcon';
const formatDate = (dateString) => {
	const now = Date.now();

	const seconds = Math.floor((now - new Date(dateString).getTime()) / 1000);

	// Handle future dates or invalid dates
	if (seconds < 0) return 'In the future';
	if (isNaN(seconds)) return 'Invalid Date';

	const intervals = [
		{ limit: 31536000, label: 'year' }, // 60*60*24*365
		{ limit: 2592000, label: 'month' }, // 60*60*24*30
		{ limit: 604800, label: 'week' }, // 60*60*24*7
		{ limit: 86400, label: 'day' }, // 60*60*24
		{ limit: 3600, label: 'hour' }, // 60*60
		{ limit: 60, label: 'minute' }, // 60
	];

	for (const interval of intervals) {
		if (seconds >= interval.limit) {
			const count = Math.floor(seconds / interval.limit);
			return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
		}
	}

	return seconds < 10 ? 'just now' : `${seconds} seconds ago`;
};
const GetStatusColor = (statusValue) => {
	if (statusValue === 'accepted') {
		return 'bg-success ring-2 ring-green-600';
	}
	if (statusValue === 'rejected') {
		return 'bg-error ring-2 ring-red-600';
	}

	return 'bg-danger';
};
const PartecipanteCard = ({
	user_id,
	utenti,
	created_at,
	status,
	is_creator,
}) => {
	return (
		<div className="w-full flex flex-row justify-between items-center">
			<div className="flex flex-row gap-4 items-center">
				<div className="w-16 h-16">
					<ProfileIcon user_id={user_id} />
				</div>
				<div className="flex flex-col gap-1">
					<div className="flex flex-row gap-3 items-center">
						<span className="text-text-1 text-xl font-body font-medium">
							{utenti.nome}
						</span>
						{is_creator && (
							<div className="font-body text-text-2 bg-bg-3 rounded-full px-2 py-1 text-sm font-medium">
								Creatore
							</div>
						)}
					</div>
					<span className="text-text-3 font-body text-sm">
						Risposto {formatDate(created_at)}
					</span>
				</div>
			</div>
			<div className={`${GetStatusColor(status)} px-5 py-2.5 rounded-full`}>
				<span className="text-bg-2 text-xl font-body font-medium">
					{status}
				</span>
			</div>
		</div>
	);
};

export default PartecipanteCard;
