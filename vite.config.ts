import { defineConfig } from "vite";
import { pathTo } from "./_/helpers";
import { viteSetup } from "./_/helpers/vite.helper";
import Unocss from "unocss/vite";

export default defineConfig(({ mode }) => {
  const { appRoot, env, envDir, dbProxy } = viteSetup(mode);
  return {
    root: appRoot, // must be scoped for hmr speed
    envDir: envDir,
    base: "",
    publicDir: pathTo("public"), // don't create 'assets' dir under here
    logLevel: "info",
    clearScreen: false,
    emptyOutDir: true,
    esbuild: {
      jsxInject: `import * as NanoJSX from "nano-jsx"`,
      jsxFactory: "NanoJSX.h",
      jsxFragment: "NanoJSX.Fragment",
    },
    build: {
      outDir: pathTo("build"),
      assetsDir: "", // relative to outDir
      emptyOutDir: true,
    },
    server: {
      host: true,
      port: Number(env._APP_PORT),
      https: false,
      cors: false,
      proxy: {
        ...dbProxy,
      },
    },
    preview: {
      host: true,
      port: Number(env._APP_PORT),
      cors: true,
      https: false,
      proxy: {
        ...dbProxy,
      },
    },
    resolve: {
      alias: {
        "@src": pathTo("src"),
        "@shared": pathTo("shared"),
      },
    },
    plugins: [Unocss("uno.config.ts")],
  };
});
