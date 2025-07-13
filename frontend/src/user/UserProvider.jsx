import { useState, useCallback, useMemo } from 'react';

import { UserContext } from './UserContext';

export const UserProvider = ({ children }) => {
  const userData = sessionStorage.getItem('user');
  const [user, setUser] = useState(userData ?? null);
  const [isLogged, setIsLogged] = useState(Boolean(userData));

  const login = useCallback(userData => {
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setIsLogged(true);
  }, []);
  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('user');
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
