import { useCallback, useState } from 'react';

const getCrsfToken = async () => {
  const token = sessionStorage.getItem('csrf_token');
  if (token) {
    return token;
  }

  try {
    const response = await fetch(
      import.meta.env.VITE_API_LOCATION + '/csrf/get-token'
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const fresh_token = await response.json()?.csrf_token;
    sessionStorage.setItem('csrf_token', fresh_token);
    return fresh_token;
  } catch (e) {
    console.error(e);
  }
};

export const useApi = ({ method = 'GET', loadingInitially = false }) => {
  let [isLoading, setLoading] = useState(loadingInitially);
  let [error, setError] = useState(null);
  let [data, setData] = useState(null);
  let [response, setResponse] = useState(null);

  const attachDefaultHeaders = useCallback(async options => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(options?.method)) {
      const csrf_token = await getCrsfToken();
      if (csrf_token) {
        options['headers'] = {
          'X-CSRF-TOKEN': csrf_token,
          ...options?.headers,
        };
      }
    }

    const access_token = sessionStorage.getItem('access_token');
    if (access_token) {
      options['headers'] = {
        Authorization: `Bearer ${access_token}`,
        ...options?.headers,
      };
    }

    return options;
  }, []);

  // TODO handle responses when access_token is no longer valid -> refreshing it with refresh_token
  const fetchFromApi = useCallback(
    async (path = '', extraFetchOptions = {}) => {
      setError(null);
      setLoading(true);
      setResponse(null);
      setData(null);
      try {
        const res = await fetch(
          import.meta.env.VITE_API_LOCATION + path,
          attachDefaultHeaders({
            method,
            ...extraFetchOptions,
          })
        );

        setResponse(res);
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        setData(await res?.json());
      } catch (e) {
        console.error('error');
        setError(e);
      }
      setLoading(false);
    },
    [attachDefaultHeaders, method]
  );

  return {
    isLoading,
    error,
    data,
    response,
    fetchFromApi,
  };
};
