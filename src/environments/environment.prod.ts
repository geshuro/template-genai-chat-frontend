export const environment = {
  production: true,
  apiUrl: '',
  oauthProperties: {
    endpoint: {
      userInfo: 'https://graph.microsoft.com/oidc/userinfo',
      logout: 'https://login.microsoftonline.com/${tenant}/oauth2/v2.0/logout',
      login:
        'https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid',
    },
  },
  clientId: '', // Application (client) ID from the app registration
  authority: '', // The Azure cloud instance and the app's sign-in audience (tenant ID, common, organizations, or consumers)
  redirectUri: '', // This is your redirect URI
  gtmId: '',
  attemptsRefreshToken: 95,
  gApiKey: '',
  gClientId: '',
};
