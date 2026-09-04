const ACCESS_TOKEN_STORAGE_KEY = 'safeRoute.accessToken';
const REFRESH_TOKEN_STORAGE_KEY = 'safeRoute.refreshToken';

const getStoredToken = (key: string) => {
  return sessionStorage.getItem(key) ?? localStorage.getItem(key);
};

export const getAccessToken = () => {
  return getStoredToken(ACCESS_TOKEN_STORAGE_KEY);
};

export const getRefreshToken = () => {
  return getStoredToken(REFRESH_TOKEN_STORAGE_KEY);
};

// refresh token의 저장 위치 기준으로 자동 로그인 여부 확인
export const isTokenPersistent = () => {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) !== null;
};

// 자동 로그인 여부에 따라 토큰 저장
export const setTokens = (accessToken: string, refreshToken: string, isPersistent: boolean) => {
  const storage = isPersistent ? localStorage : sessionStorage;
  const otherStorage = isPersistent ? sessionStorage : localStorage;

  otherStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  otherStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  storage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  storage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
};
