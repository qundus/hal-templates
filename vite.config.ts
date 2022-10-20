import { defineConfig } from "vite";
import { join } from "node:path";
import { viteSetup } from "./_/sweetfeather/helpers/vite.helper";
import Unocss from "unocss/vite";

/**
 * function to help with paths
 */
export const pathTo = (...paths: string[]) => {
  return join(process.cwd(), ...paths);
};

export default defineConfig(({ mode }) => {
  const { appRoot, env, envDir, dbProxy } = viteSetup(mode);
  return {
    root: appRoot, // must be scoped for hmr speed
    envDir: envDir,
    base: "",
    publicDir: pathTo("assets"), // don't create 'assets' dir under here
    logLevel: "info",
    clearScreen: false,
    emptyOutDir: true,
    esbuild: {
      jsxInject: `import * as NanoJSX from "nano-jsx"`,
      jsxFactory: "NanoJSX.h",
      jsxFragment: "NanoJSX.Fragment",
    },
    build: {
      outDir: pathTo("_", "build", "demo"),
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
      alias: [
        { find: /^[:](.*)/, replacement: pathTo(`$1`) }
      ],
    },
    plugins: [Unocss("uno.config.ts")],
  };
});
