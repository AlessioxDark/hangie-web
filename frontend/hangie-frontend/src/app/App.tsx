import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/desktop/Login';
import SignUp from './pages/desktop/SignUp';

import EventDetailsModal from '@/features/events/EventDetailsModal';
import { AuthContextProvider } from '../contexts/AuthContext';
import { ModalContext, ModalProvider } from '../contexts/ModalContext';
import Chats from './pages/Chats';
import EventsSuspended from './pages/EventsSuspended';
import Home from './pages/Home';
import ResponsiveLayoutWrapper from './pages/ResponsiveLayoutWrapper';
function App() {
	return (
		<BrowserRouter>
			<AuthContextProvider>
				<ModalProvider>
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
				</ModalProvider>
			</AuthContextProvider>
		</BrowserRouter>
	);
}

export default App;
