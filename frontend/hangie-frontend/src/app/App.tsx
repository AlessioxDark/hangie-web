import EventPage from '@/features/EventsHomePage/EventPage';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LayoutDesktop from '../components/Layouts/desktop/LayoutDesktop';
import LayoutMobile from '../components/Layouts/mobile/LayoutMobile';
import Login from './pages/desktop/Login';
import SignUp from './pages/desktop/SignUp';

import EventDetailsModal from '@/components/events/EventDetailsModal';
import Chats from './pages/Chats';
import ChatsSidebar from './pages/ChatsSidebar';
import EventsSuspended from './pages/EventsSuspended';
import Home from './pages/Home';
import { ModalContext } from './pages/ModalContext';
import ResponsiveLayoutWrapper from './pages/ResponsiveLayoutWrapper';
import { UserContext } from './UserContext';

function App() {
	const [isOpen, setIsOpen] = useState(false);
	const [modalData, setModalData] = useState({ event_id: null });
	const [isAuth, setIsAuth] = useState(false);
	const [userData, setUserData] = useState([]);
	const [userId, setUserId] = useState([]);
	const [token, setToken] = useState([]);

	return (
		<BrowserRouter>
			<UserContext.Provider
				value={{
					isAuthenticated: isAuth,
					setIsAuthenticated: setIsAuth,
					userId: userId,
					token,
					setToken,
					setUserData: setUserData,
					setUserId: setUserId,
					userData: userData,
				}}
			>
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
			</UserContext.Provider>
		</BrowserRouter>
	);
}

export default App;
