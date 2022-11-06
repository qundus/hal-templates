const withTM = require("next-transpile-modules")(["@-/fe.components.nextjs"]);

module.exports = withTM({
  reactStrictMode: true,
});
