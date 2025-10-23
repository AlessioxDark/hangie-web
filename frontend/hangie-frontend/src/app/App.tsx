import EventPage from '@/features/EventsHomePage/EventPage';
import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LayoutSidebar from '../components/Layouts/LayoutSidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Sidebar from './pages/Sidebar';
import SignUp from './pages/SignUp';
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
						<LayoutSidebar>
							<Home />
						</LayoutSidebar>
					}
				/>
				<Route
					path="/events/:event_id"
					element={
						<LayoutSidebar>
							<EventPage />
						</LayoutSidebar>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
