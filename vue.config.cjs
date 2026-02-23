const crypto = require('crypto');

// Fix for Node.js 22+ which removed the legacy MD4 hash algorithm
// that webpack 4 uses by default
const cryptoOrigCreateHash = crypto.createHash;
crypto.createHash = (algorithm) =>
  cryptoOrigCreateHash(algorithm === 'md4' ? 'sha256' : algorithm);

module.exports = {
  // Disable host check for dev server compatibility
  devServer: {
    disableHostCheck: true,
  },
};
