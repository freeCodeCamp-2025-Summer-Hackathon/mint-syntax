import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';

import { UserContext } from './UserContext';
import Spinny from '../components/Spinny';

const initialData = {
  upvotes: new Set(),
  downvotes: new Set(),
  is_admin: false,
  isLogged: false,
  id: null,
  name: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'upvote':
      return {
        ...state,
        upvotes: new Set([...state.upvotes, action.ideaId]),
        downvotes: new Set(
          [...state.downvotes].filter(id => action.ideaId !== id)
        ),
      };
    case 'downvote':
      return {
        ...state,
        downvotes: new Set([...state.downvotes, action.ideaId]),
        upvotes: new Set([...state.upvotes].filter(id => action.ideaId !== id)),
      };
    case 'login':
      return {
        ...state,
        ...action.data,
        downvotes: new Set([...action.data.downvotes]),
        upvotes: new Set([...action.data.upvotes]),
        isLogged: true,
      };
    case 'logout':
      return {
        ...initialData,
        isLogged: false,
      };
    default:
      return { ...state };
  }
};

export const UserProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userState, dispatch] = useReducer(reducer, initialData);

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(
          import.meta.env.VITE_API_LOCATION + '/me',
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (!response.ok) {
          localStorage.removeItem('access_token');
          if (response.status === 401) {
            const refresh_response = await fetch(
              import.meta.env.VITE_API_LOCATION + '/refresh',
              {
                credentials: 'include',
              }
            );
            if (refresh_response.ok) {
              const data = await refresh_response.json();
              localStorage.setItem('access_token', data.access_token);
              return fetchUser();
            }
          } else {
            throw new Error(response.statusText);
          }
        }
        const data = await response.json();
        dispatch({ type: 'login', data });
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const isLogged = useMemo(() => userState?.isLogged, [userState?.isLogged]);

  const isAdmin = useMemo(() => userState?.is_admin, [userState?.is_admin]);

  const login = useCallback(
    data => {
      dispatch({ type: 'login', data: data.user_data });
      localStorage.setItem('access_token', data?.token.access_token);
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch({ type: 'logout' });
    localStorage.removeItem('access_token');
  }, [dispatch]);

  const upvote = ideaId => {
    dispatch({ type: 'upvote', ideaId });
  };

  const downvote = ideaId => {
    dispatch({ type: 'downvote', ideaId });
  };

  const context = useMemo(
    () => ({
      dispatch,
      downvote,
      isAdmin,
      isLogged,
      login,
      logout,
      upvote,
      userState,
    }),
    [login, logout, isAdmin, isLogged, userState, dispatch]
  );

  if (isLoading) {
    return <Spinny />;
  }

  return <UserContext value={context}>{children}</UserContext>;
};
