import expoConfig from "eslint-config-expo/flat.js";
import prettierConfig from "eslint-config-prettier";

export default [
    ...expoConfig,
    prettierConfig,
    {
        ignores: [
            "node_modules/**",
            ".expo/**",
            ".claude/**",
            "dist/**",
            "build/**",
            "android/**",
            "ios/**",
            "coverage/**",
            "*.config.js",
            "*.config.mjs",
            "*.config.cjs",
            "babel.config.js",
        ],
    },
];
