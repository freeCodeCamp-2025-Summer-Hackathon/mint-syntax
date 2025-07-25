import { apiUrl } from '../utils/apiUrl';

export const getCrsfToken = async ({ forceNew = false } = {}) => {
  if (!forceNew) {
    const token = sessionStorage.getItem('csrf_token');
    if (token) {
      return token;
    }
  }

  sessionStorage.removeItem('csrf_token');

  try {
    const response = await fetch(apiUrl('/csrf/get-token'), {
      credentials: 'include',
    });

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

export const refreshAccessToken = async () => {
  try {
    const response = await fetch(apiUrl('/refresh'), {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    if (data?.access_token) {
      localStorage.setItem('access_token', data.access_token);
      return true;
    }
  } catch (e) {
    console.error(e);
    return false;
  }
  return false;
};
