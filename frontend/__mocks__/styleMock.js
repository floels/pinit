module.exports = new Proxy({}, { get: (_, prop) => (prop === "__esModule" ? false : prop) });
