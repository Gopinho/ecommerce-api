const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
    testEnvironment: "node",
    transform: {
        ...tsJestTransformCfg,
    },
    extensionsToTreatAsEsm: ['.ts'],
    transformIgnorePatterns: [
        "node_modules/(?!(swagger-jsdoc)/)"
    ],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
    testTimeout: 15000,
    forceExit: true,
    detectOpenHandles: true,
    maxWorkers: 1,
    globals: {
        'ts-jest': {
            useESM: true
        }
    },
    testPathIgnorePatterns: [
        "<rootDir>/node_modules/",
        "<rootDir>/dist/"
    ],
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true
};