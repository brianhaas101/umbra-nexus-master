import { loadSecureEnv } from "./l01_secure_env_loader.js";

const result = loadSecureEnv();

console.log(JSON.stringify(result, null, 2));
