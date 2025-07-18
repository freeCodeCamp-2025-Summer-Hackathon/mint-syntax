import { useState, useCallback, useMemo } from 'react';

import { UserContext } from './UserContext';

export const UserProvider = ({ children }) => {
  const userData = sessionStorage.getItem('user');
  const [user, setUser] = useState(userData ?? null);
  const [isLogged, setIsLogged] = useState(Boolean(userData));

  const login = useCallback(userData => {
    setUser(userData);
    sessionStorage.setItem('user', userData);
    sessionStorage.setItem('access_token', userData?.access_token);
    setIsLogged(true);
  }, []);
  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('access_token');
    setIsLogged(false);
  }, []);

  const context = useMemo(
    () => ({
      user,
      isLogged,
      login,
      logout,
    }),
    [login, logout, user, isLogged]
  );

  return <UserContext value={context}>{children}</UserContext>;
};
