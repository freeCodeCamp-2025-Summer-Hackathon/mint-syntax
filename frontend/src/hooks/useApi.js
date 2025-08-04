import { useCallback, useEffect, useState } from 'react';

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

  // TODO occasionally update refresh_token with new value
  const fetchFromApi = useCallback(
    async (path = '', extraFetchOptions = {}) => {
      setError(null);
      setLoading(true);
      setResponse(null);
      setData(null);
      return await sendRequest(path, extraFetchOptions);
    },
    [sendRequest]
  );

  const sendAsJson = useCallback(
    async (
      path = '',
      obj = {},
      { headers, ...restOptions } = { headers: {} }
    ) => {
      console.log(path, obj);
      return await fetchFromApi(path, {
        headers: { 'content-type': 'application/json', ...headers },
        body: JSON.stringify(obj),
        ...restOptions,
      });
    },
    [fetchFromApi]
  );

  const sendFormData = useCallback(
    async (path = '', { formRef, formData } = {}, extraFetchOptions = {}) => {
      if (!formRef && !formData) {
        return;
      }

      return await fetchFromApi(path, {
        body: formRef ? new FormData(formRef.current) : formData,
        ...extraFetchOptions,
      });
    },
    [fetchFromApi]
  );

  useEffect(() => {
    if (data && isLoading) {
      setLoading(false);
    }
  }, [data, isLoading]);

  return {
    isLoading,
    error,
    data,
    response,
    fetchFromApi,
    sendAsJson,
    sendFormData,
  };
};
