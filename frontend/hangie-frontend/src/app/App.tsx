import EventPage from '@/features/EventsHomePage/EventPage';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LayoutDesktop from '../components/Layouts/desktop/LayoutDesktop';
import LayoutMobile from '../components/Layouts/mobile/LayoutMobile';
import Login from './pages/desktop/Login';
import SignUp from './pages/desktop/SignUp';

import EventDetailsModal from '@/features/events/EventDetailsModal';
import { AuthContextProvider } from '../contexts/AuthContext';
import { ModalContext } from '../contexts/ModalContext';
import ChatsSidebar from '../features/chats/ChatsSidebar';
import Chats from './pages/Chats';
import EventsSuspended from './pages/EventsSuspended';
import Home from './pages/Home';
import ResponsiveLayoutWrapper from './pages/ResponsiveLayoutWrapper';
function App() {
	const [isOpen, setIsOpen] = useState(false);
	const [modalData, setModalData] = useState({ event_id: null });

	return (
		<BrowserRouter>
			<AuthContextProvider>
				<ModalContext.Provider
					value={{
						setIsOpen: setIsOpen,
						isOpen: isOpen,
						openModal: () => {
							setIsOpen(true);
						},
						closeModal: () => {
							setIsOpen(false);
						},
						modalData: modalData,
						setModalData: setModalData,
					}}
				>
					<Routes>
						<Route path="/signup" element={<SignUp />}></Route>
						<Route path="/login" element={<Login />}></Route>
						<Route
							path="/chats"
							element={
								<ResponsiveLayoutWrapper layoutType="chat">
									<Chats />
								</ResponsiveLayoutWrapper>
							}
						></Route>

						<Route
							path="/"
							element={
								<ResponsiveLayoutWrapper>
									<Home />
								</ResponsiveLayoutWrapper>
							}
						/>
						<Route
							path="/events/suspended/all"
							element={
								<ResponsiveLayoutWrapper>
									<EventsSuspended />
								</ResponsiveLayoutWrapper>
							}
						/>
					</Routes>
					<EventDetailsModal />
				</ModalContext.Provider>
			</AuthContextProvider>
		</BrowserRouter>
	);
}

export default App;
