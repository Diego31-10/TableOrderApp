// Dynamic Expo config — extends app.json with secrets that must NOT be hardcoded.
// The RNMAPBOX_MAPS_DOWNLOAD_TOKEN (sk.eyJ1...) is only needed at native build time
// to authenticate with Mapbox's private Maven/CocoaPods repository.
// The plugin reads this env var automatically — no need to pass it as a plugin option.
// Add it to your .env file and to expo.dev → Project → Environment Variables.

const { expo } = require('./app.json');

module.exports = ({ config }) => ({
  ...expo,
  plugins: [
    ...(expo.plugins ?? []),
    '@rnmapbox/maps',
  ],
});
