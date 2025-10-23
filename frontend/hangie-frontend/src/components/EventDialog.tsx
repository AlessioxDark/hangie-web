import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import React from 'react';
const EventDialog = ({ isOpen, setIsOpen }) => {
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger className="w-full"></DialogTrigger>
			<DialogContent className="bg-white border-none"></DialogContent>
		</Dialog>
	);
};

export default EventDialog;
