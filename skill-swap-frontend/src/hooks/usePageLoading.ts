import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';

export function usePageLoading() {
  const location = useLocation();
  const { setIsLoading, setLoadingMessage } = useLoading();

  useEffect(() => {
    // Start loading when navigation begins
    setIsLoading(true);
    setLoadingMessage('Loading page...');

    // Create a timeout to simulate minimum loading time and prevent flashing
    const minLoadingTime = setTimeout(() => {
      setIsLoading(false);
      setLoadingMessage('');
    }, 500);

    return () => {
      clearTimeout(minLoadingTime);
      setIsLoading(false);
      setLoadingMessage('');
    };
  }, [location.pathname, setIsLoading, setLoadingMessage]);
}
