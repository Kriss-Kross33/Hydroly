const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Yarn `file:` packages are copied into node_modules — resolve local packages
// from ./packages so source edits apply without reinstalling.
const localPackages = {
  "@hydroly/revenuecat-service": path.resolve(
    projectRoot,
    "packages/revenuecat-service"
  ),
  "@hydroly/crashlytics": path.resolve(projectRoot, "packages/crashlytics"),
  "@hydroly/firebase-auth": path.resolve(projectRoot, "packages/firebase-auth"),
  "@hydroly/local-storage-api": path.resolve(
    projectRoot,
    "packages/local-storage-api"
  ),
  "@hydroly/push-notifications": path.resolve(
    projectRoot,
    "packages/push_notifications"
  ),
  "@hydroly/realm-repository": path.resolve(
    projectRoot,
    "packages/realm-repository"
  ),
  "@hydroly/remote-config-service": path.resolve(
    projectRoot,
    "packages/remote_config_service"
  ),
};

config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(projectRoot, "packages"),
];

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  ...localPackages,
};

module.exports = withNativeWind(config, { input: "./global.css" });
