import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useUser } from '../hooks/useUser';

export const EnsureLogin = ({ children }) => {
  const { isLogged } = useUser();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLogged) {
      navigate(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  });

  if (!isLogged) {
    return null;
  }

  return <>{children}</>;
};

export default EnsureLogin;
