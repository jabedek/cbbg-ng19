export const devEnv = {
  production: false,
  TAILWIND_MODE: 'build',
  environmentName: 'development',
  domainUrl: 'https://localhost:4200',
  auth0: {
    domain: 'AUTH-DOMAIN.com',
    clientId: 'abc',
    redirectUri: window.location.origin,
  },
};
