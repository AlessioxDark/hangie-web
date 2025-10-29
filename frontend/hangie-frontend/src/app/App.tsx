import EventPage from '@/features/EventsHomePage/EventPage';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LayoutDesktop from '../components/Layouts/desktop/LayoutDesktop';
import LayoutMobile from '../components/Layouts/mobile/LayoutMobile';
import Home from './pages/desktop/Home';
import Login from './pages/desktop/Login';
import SignUp from './pages/desktop/SignUp';
import ResponsiveLayoutWrapper from './pages/ResponsiveLayoutWrapper';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/signup" element={<SignUp />}></Route>
				<Route path="/login" element={<Login />}></Route>
				<Route path="/login" element={<Home />}></Route>

				<Route
					path="/"
					element={
						<ResponsiveLayoutWrapper>
							<Home />
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
