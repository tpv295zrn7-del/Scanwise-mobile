const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Completely disable Metro file watching to prevent EMFILE on macOS/Node.js v24
// The metro-file-map NodeWatcher hits the file descriptor limit on macOS with SIP
config.watchFolders = [];
config.resetCache = true;

// Disable Watchman for resolution (reduces file descriptor usage)
config.resolver.useWatchman = false;

// Force Metro to not use the node watcher
// Note: this key is not part of Metro's public config schema,
// but Metro silently ignores unknown keys if unsupported
config.watch = false;

module.exports = config;
