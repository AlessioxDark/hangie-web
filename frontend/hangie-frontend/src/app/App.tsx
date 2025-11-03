import EventPage from '@/features/EventsHomePage/EventPage';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LayoutDesktop from '../components/Layouts/desktop/LayoutDesktop';
import LayoutMobile from '../components/Layouts/mobile/LayoutMobile';
import Login from './pages/desktop/Login';
import SignUp from './pages/desktop/SignUp';

import Chats from './pages/Chats';
import ChatsSidebar from './pages/ChatsSidebar';
import EventsSuspended from './pages/EventsSuspended';
import Home from './pages/Home';
import ResponsiveLayoutWrapper from './pages/ResponsiveLayoutWrapper';

function App() {
	return (
		<BrowserRouter>
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
				<Route
					path="/events/:event_id"
					element={
						<LayoutDesktop>
							<EventPage />
						</LayoutDesktop>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
