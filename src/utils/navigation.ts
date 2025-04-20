
import { useNavigate } from 'react-router-dom';

export const useRefresh = () => {
  const navigate = useNavigate();
  
  return () => {
    // This will refresh the current route using React Router
    const currentPath = window.location.pathname;
    navigate('/', { replace: true });
    // Small delay before navigating back to ensure state is reset
    setTimeout(() => {
      navigate(currentPath, { replace: true });
    }, 10);
  };
};
