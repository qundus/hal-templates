import { loadEnv } from "vite";
import { join } from "path";

export function viteSetup(mode) {
  process.env.NODE_ENV = mode;
  // getCommands();
  // set which project we're working on
  const appRoot = join(process.cwd(), "apps", "demo");
  // set .env files dir
  const envDir = join(process.cwd());
  const env = loadEnv(mode, envDir, "_");
  // necessary to spread mode across app
  // if (mode === "development") process.env.inDev = "true";
  // process.env = { ...process.env, ...env };
  // define proxy for databases like AceBase and Couchdb
  const dbProxy = {};
  if (env._DB_HOST && env._DB_PORT) {
    ["/socket.io", "/auth"].forEach((s) => {
      dbProxy[s] = "ws://" + env._DB_HOST + ":" + env._DB_PORT;
    });
  }

  return {
    appRoot,
    envDir,
    env,
    dbProxy,
  };
}

function getCommands() {
  const result = {
    app: "",
  };
  const commands = process.argv.splice(process.argv.indexOf("--"));
  console.log("reached vite.helper :: ", commands);
}
