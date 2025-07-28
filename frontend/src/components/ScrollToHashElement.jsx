import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router';

// From https://dev.to/mindactuate/scroll-to-anchor-element-with-react-router-v6-38op
const ScrollToHashElement = () => {
  const location = useLocation();
  const lastHash = useRef('');

  // listen to location change using useEffect with location as dependency
  useEffect(() => {
    if (location.hash) {
      lastHash.current = location.hash.slice(1); // safe hash for further use after navigation
    }

    if (lastHash.current && document.getElementById(lastHash.current)) {
      setTimeout(() => {
        document
          .getElementById(lastHash.current)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        lastHash.current = '';
      }, 100);
    }
  }, [location]);
  return null;
};

export default ScrollToHashElement;
