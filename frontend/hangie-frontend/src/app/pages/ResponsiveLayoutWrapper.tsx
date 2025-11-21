import LayoutChatDesktop from '@/components/Layouts/desktop/chats/LayoutChatDesktop';
import LayoutDesktop from '@/components/Layouts/desktop/LayoutDesktop';
import LayoutMobile from '@/components/Layouts/mobile/LayoutMobile';
import useMediaQuery from '@/hooks/IsDekstop';
import { useEffect, useState } from 'react';
// const useMediaQuery = (query) => {
// 	const [matches, setMatches] = useState(() => {
// 		// Determinazione iniziale basata sullo stato della finestra
// 		if (typeof window !== 'undefined') {
// 			return window.matchMedia(query).matches;
// 		}
// 		return false;
// 	});

// 	useEffect(() => {
// 		const media = window.matchMedia(query);
// 		if (media.matches !== matches) {
// 			setMatches(media.matches);
// 		}

// 		// Aggiunge il listener per la reattività
// 		const listener = (event) => setMatches(event.matches);
// 		media.addEventListener('change', listener);

// 		// Cleanup: Rimuove il listener quando il componente viene smontato
// 		return () => media.removeEventListener('change', listener);
// 	}, [matches, query]);

// 	return matches;
// };
const ResponsiveLayoutWrapper = ({ children, layoutType = 'standard' }) => {
	// L'hook è chiamato correttamente qui, al top-level del componente wrapper.
	const isDesktop = useMediaQuery('(min-width: 1280px)');
	console.log(isDesktop);

	// Se desktop, usa il LayoutDesktop
	if (isDesktop) {
		if (layoutType == 'chat') {
			return <LayoutChatDesktop></LayoutChatDesktop>;
		}
		return <LayoutDesktop>{children}</LayoutDesktop>;
	}

	// Se mobile, usa il LayoutMobile
	return <LayoutMobile>{children}</LayoutMobile>;
};
export default ResponsiveLayoutWrapper;
