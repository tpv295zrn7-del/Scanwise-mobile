const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Prevent EMFILE crash on macOS by limiting file watching
// to the project directory instead of crawling node_modules
config.watchFolders = [__dirname];
config.resetCache = true;

module.exports = config;
