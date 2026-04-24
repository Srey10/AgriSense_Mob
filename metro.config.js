const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for @react-navigation v7 web bundling —
// Metro sometimes fails to resolve ".js" imports on web.
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'];
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
