import { useCallback, useState } from 'react';

import { apiUrl } from '../utils/apiUrl';
import { getCrsfToken, refreshAccessToken } from '../user/utils';

export const useApi = ({ method = 'GET', loadingInitially = false } = {}) => {
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
          apiUrl(path),
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
              return await sendRequest(path, extraFetchOptions);
            } else if (
              response.status === 401 &&
              responseJson.detail.includes('Could not validate credentials')
            ) {
              const refreshResult = await refreshAccessToken();
              if (refreshResult) {
                return await sendRequest(path, extraFetchOptions);
              }
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
