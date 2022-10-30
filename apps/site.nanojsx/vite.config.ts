import { defineConfig } from "vite";
import Unocss from "unocss/vite";

/**
 * function to help with paths
 */
// export const pathTo = (...paths: string[]) => {
//   return join(process.cwd(), ...paths);
// };

export default defineConfig(({ mode }) => {
  // const { appRoot, env, envDir, dbProxy } = viteSetup(mode);
  return {
    root: ".", // must be scoped for hmr speed
    envDir: ".",
    base: "",
    publicDir: "./assets", // don't create 'assets' dir under here
    logLevel: "info",
    clearScreen: false,
    emptyOutDir: true,
    esbuild: {
      jsxInject: `import * as NanoJSX from "nano-jsx"`,
      jsxFactory: "NanoJSX.h",
      jsxFragment: "NanoJSX.Fragment",
    },
    build: {
      outDir: "./build",
      assetsDir: "", // relative to outDir
      emptyOutDir: true,
    },
    server: {
      host: true,
      port: 3000,
      https: false,
      cors: false,
      // proxy: {
      //   ...dbProxy,
      // },
    },
    preview: {
      host: true,
      port: 4000,
      cors: true,
      https: false,
      // proxy: {
      //   ...dbProxy,
      // },
    },
    // resolve: {
    //   alias: [
    //     { find: /^[:](.*)/, replacement: pathTo(`$1`) }
    //   ],
    // },
    plugins: [Unocss("uno.config.ts")],
  };
});
