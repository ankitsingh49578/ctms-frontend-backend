/**
 * Development environment.
 *
 * apiBaseUrl is '' (same origin) on purpose: `npm start` runs `ng serve` with
 * proxy.conf.json, which forwards every /api/** request to http://localhost:8080.
 * This means the browser only ever talks to http://localhost:4200, so there is
 * NO cross-origin request and the backend CORS config does not come into play
 * during local development.
 */
export const environment = {
  production: false,
  apiBaseUrl: '',
};
