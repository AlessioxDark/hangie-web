import useMediaQuery from '@/hooks/IsDekstop';
import React from 'react';
import HomeDesktop from './desktop/HomeDesktop';
import HomeMobile from './mobile/HomeMobile';

const Home = () => {
	const isDesktop = useMediaQuery('(min-width: 1280px)');
	return isDesktop ? <HomeDesktop /> : <HomeMobile />;
};

export default Home;
