
import { useNavigate } from 'react-router-dom';

// This hook is meant to be used within React components
export const useRefresh = () => {
  const navigate = useNavigate();
  
  return () => {
    // This will refresh the current route using React Router
    navigate(0);
  };
};

// This function can be used anywhere, not just in components
export const redirectToLogin = () => {
  // For global redirects outside of React components
  window.location.href = "/login";
};
