/**
 * Production environment.
 *
 * apiBaseUrl is left as a same-origin relative prefix ('') so that in production
 * the Angular app is served behind the same gateway/reverse-proxy as the API and
 * calls go to /api/** on the same origin (no CORS). If you instead deploy the
 * frontend on a different origin to the backend, set apiBaseUrl to the absolute
 * backend URL (e.g. 'https://api.ctms.example.com') AND add that frontend origin
 * to the backend's ctms.cors.allowed-origins.
 */
export const environment = {
  production: true,
  apiBaseUrl: '',
};
