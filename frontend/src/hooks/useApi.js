import { useCallback, useState } from 'react';

const getCrsfToken = async ({ forceNew = false } = {}) => {
  if (!forceNew) {
    const token = sessionStorage.getItem('csrf_token');
    if (token) {
      return token;
    }
  }

  sessionStorage.removeItem('csrf_token');

  try {
    const response = await fetch(
      import.meta.env.VITE_API_LOCATION + '/csrf/get-token',
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const freshToken = (await response.json())?.csrf_token;
    sessionStorage.setItem('csrf_token', freshToken);
    return freshToken;
  } catch (e) {
    console.error(e);
  }
};

export const useApi = ({ method = 'GET', loadingInitially = false }) => {
  const [isLoading, setLoading] = useState(loadingInitially);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [response, setResponse] = useState(null);

  const attachDefaultHeaders = useCallback(async options => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(options?.method)) {
      const csrfToken = await getCrsfToken();
      if (csrfToken) {
        options['headers'] = {
          'X-CSRF-TOKEN': csrfToken,
          ...options?.headers,
        };
      }
    }

    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      options['headers'] = {
        Authorization: `Bearer ${accessToken}`,
        ...options?.headers,
      };
    }

    return { ...options, credentials: 'include' };
  }, []);

  const sendRequest = useCallback(
    async (path = '', extraFetchOptions = {}) => {
      try {
        const response = await fetch(
          import.meta.env.VITE_API_LOCATION + path,
          await attachDefaultHeaders({
            method,
            ...extraFetchOptions,
          })
        );

        setResponse(response);
        if (!response.ok) {
          try {
            const responseJson = await response.json();
            if (
              response.status === 403 &&
              responseJson.detail.includes('Missing Cookie')
            ) {
              await getCrsfToken({ forceNew: true });
              return await sendRequest();
            }
            setData(responseJson);
          } catch (e) {
            console.error(e);
          }

          throw new Error(response.statusText);
        }
        setData(await response.json());
      } catch (e) {
        console.error('error', e);
        setError(e);
      }
    },
    [attachDefaultHeaders, method]
  );

  // TODO handle responses when access_token is no longer valid -> refreshing it with refresh_token
  const fetchFromApi = useCallback(
    async (path = '', extraFetchOptions = {}) => {
      setError(null);
      setLoading(true);
      setResponse(null);
      setData(null);
      await sendRequest(path, extraFetchOptions);
      setLoading(false);
    },
    [sendRequest]
  );

  return {
    isLoading,
    error,
    data,
    response,
    fetchFromApi,
  };
};
