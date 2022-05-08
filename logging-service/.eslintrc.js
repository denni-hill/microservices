module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: "latest"
  },
  extends: ["plugin:prettier/recommended"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
        trailingComma: "none"
      }
    ],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "no-console": "off"
  }
};
