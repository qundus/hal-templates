import { defineConfig, loadEnv } from "vite";
import { join } from "path";
import WindiCSS from "vite-plugin-windicss";
// import Icons from "unplugin-icons/vite";

function setup(mode) {
  // necessary to spread mode across app
  process.env.mode = mode;
  // set root of project; differs on multi-[root|vite.config] project
  const root = join(process.cwd());
  // for me, all .env files are under root..you pick what you like
  const envDir = process.cwd();
  return {
    root,
    envDir,
    env: loadEnv(mode, envDir),
    // define proxy for databases like AceBase and Couchdb
    proxy: function () {
      if (this.env.VITE_DB_HOST) {
        ["/socket.io", "/auth"].forEach((s) => {
          return {
            [s]: "ws://" + this.env.VITE_DB_HOST + ":" + this.env.VITE_DB_PORT,
          };
        });
      }
      return {};
    },
    // function to help with paths
    pathTo: function (...paths: string[]) {
      return join(root, ...paths);
    },
  };
}
// vite config
export default defineConfig(({ mode }) => {
  const _ = setup(mode);
  return {
    root: _.root, // must be scoped for hmr speed
    envDir: _.envDir,
    base: "",
    publicDir: _.pathTo("shared"), // don't create 'assets' dir under here
    logLevel: "info",
    clearScreen: false,
    emptyOutDir: true,
    esbuild: {
      jsxInject: `import * as NanoJSX from "nano-jsx"`,
      jsxFactory: "NanoJSX.h",
      jsxFragment: "NanoJSX.Fragment",
    },
    build: {
      outDir: _.pathTo("build"),
      assetsDir: "src", // relative to outDir
      emptyOutDir: true,
    },
    server: {
      host: true,
      port: Number(_.env.VITE_APP_PORT),
      https: false,
      proxy: _.proxy(),
    },
    preview: {
      host: true,
      port: Number(_.env.VITE_APP_PORT),
      cors: true,
      open: false,
      https: false,
      proxy: _.proxy(),
    },
    resolve: {
      alias: {
        "@src": _.pathTo("src"),
        "@shared": _.pathTo("shared"),
      },
    },
    plugins: [
      // Icons({ compiler: "jsx", jsx: "preact" }),
      WindiCSS({
        config: _.pathTo("windi.config.ts"),
        scan: {
          include: [_.pathTo("**", "*.{css,tsx,jsx}")],
          exclude: [_.pathTo("node_modules"), _.pathTo(".git")],
        },
      }),
    ],
  };
});
