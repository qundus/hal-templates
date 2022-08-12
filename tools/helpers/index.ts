// never collect imports,
// it makes vite loading time longer for some reason
// export { viteSetup } from "./vite.helper";
// export { makeClasses, makePreflights, makeShortcuts } from "./uno.helper";
import { join } from "node:path";

// function to help with paths
export const pathTo = (...paths: string[]) => {
  return join(process.cwd(), ...paths);
};
