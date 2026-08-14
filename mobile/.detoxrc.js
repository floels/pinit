// Detox configuration. See https://wix.github.io/Detox/docs/config/overview
//
// `ios.sim.release` is self-contained: the JavaScript bundle sits inside the
// binary. Use it for a full run.
// `ios.sim.debug` loads JavaScript from Metro, so a JavaScript change needs no
// rebuild. Start Metro with `yarn start` before you use it.
/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: "jest",
      config: "e2e-tests/jest.config.js",
    },
    jest: {
      setupTimeout: 180_000,
    },
  },
  apps: {
    "ios.release": {
      type: "ios.app",
      binaryPath: "ios/build/Build/Products/Release-iphonesimulator/pinit.app",
      build: "scripts/build-ios-e2e.sh Release",
    },
    "ios.debug": {
      type: "ios.app",
      binaryPath: "ios/build/Build/Products/Debug-iphonesimulator/pinit.app",
      build: "scripts/build-ios-e2e.sh Debug",
    },
  },
  devices: {
    simulator: {
      type: "ios.simulator",
      device: {
        type: "iPhone 16",
      },
    },
  },
  configurations: {
    "ios.sim.release": {
      device: "simulator",
      app: "ios.release",
    },
    "ios.sim.debug": {
      device: "simulator",
      app: "ios.debug",
    },
  },
};
