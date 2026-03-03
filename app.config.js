// Dynamic Expo config — extends app.json with secrets that must NOT be hardcoded.
// The MAPBOX_SECRET_TOKEN (sk.eyJ1...) is only needed at native build time
// to authenticate with Mapbox's private Maven/CocoaPods repository.
// Add it to your .env file (see SETUP2.md for instructions).

const { expo } = require('./app.json');

module.exports = ({ config }) => ({
  ...expo,
  plugins: [
    ...(expo.plugins ?? []),
    [
      '@rnmapbox/maps',
      {
        // Secret token — used only during `npx expo prebuild` / `eas build`
        // Get yours at mapbox.com → Account → Tokens → Create secret token (DOWNLOADS:READ scope)
        RNMapboxMapsDownloadToken: process.env.MAPBOX_SECRET_TOKEN ?? '',
      },
    ],
  ],
});
