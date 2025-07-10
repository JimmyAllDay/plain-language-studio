import type { Config } from "jest";

const config: Config = {
	testEnvironment: "jsdom",
	roots: ["<rootDir>/src"],
	transform: {
		"^.+\\.(t|j)sx?$": [
			"ts-jest",
			{
				tsconfig: "tsconfig.jest.json",
				useESM: true,
			},
		],
	},
	transformIgnorePatterns: ["/node_modules/(?!(text-readability)/)"],
	extensionsToTreatAsEsm: [".ts", ".tsx"],
	globals: {
		"ts-jest": {
			diagnostics: {
				ignoreCodes: [1343],
			},
		},
	},
	moduleNameMapper: {
		"\\.(css|less|sass|scss)$": "identity-obj-proxy",
		"^@/(.*)$": "<rootDir>/src/$1",
	},
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

export default config;
