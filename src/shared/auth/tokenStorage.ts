const ACCESS_TOKEN_STORAGE_KEY = 'safeRoute.accessToken';

export const getAccessToken = () => {
  return (
    sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ??
    localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
  );
};

export const setAccessToken = (accessToken: string, isPersistent: boolean) => {
  const storage = isPersistent ? localStorage : sessionStorage;
  const otherStorage = isPersistent ? sessionStorage : localStorage;

  otherStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  storage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
};

export const clearAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
};
