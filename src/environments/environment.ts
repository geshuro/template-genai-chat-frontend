// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'https://metatron.dev.apislatam.com',
  oauthProperties: {
    endpoint: {
      userInfo: 'https://graph.microsoft.com/oidc/userinfo',
      logout: 'https://login.microsoftonline.com/${tenant}/oauth2/v2.0/logout',
      login:
        'https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid',
    },
  },
  clientId: '6435575b-cbdc-44d9-8509-a04099674df0', // Application (client) ID from the app registration
  authority:
    'https://login.microsoftonline.com/99d911b9-6dc3-401c-9398-08fc6b377b74', // The Azure cloud instance and the app's sign-in audience (tenant ID, common, organizations, or consumers)
  redirectUri: 'http://localhost:4200/', // This is your redirect URI
  gtmId: 'G-BD2TRGR2F2', // this is the real measurement ID for metatron dev google analytics property. It works locally as well, that's why we can just add it here for local testing.
  attemptsRefreshToken: 95,
  gApiKey: 'AIzaSyAomQdYQKtb3iGA9_loYUI-JPL7uQMuXaM',
  gClientId:
    '431181205012-jv64tmaih1m5ua0ospmc3l024t6pr46k.apps.googleusercontent.com',
};
