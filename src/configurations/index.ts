import * as nconf from "nconf";
import * as path from "path";

// Read Configurations
const configs = new nconf.Provider()
  .env({ lowerCase: true, separator: "." })
  .file({ file: path.join(__dirname, `./config.dev.json`) });

export interface IConfigurations {
  serverPort: number;
  retryCount: number;
}

export const getConfig = (): IConfigurations => {
  return {
    serverPort: configs.get("server_port"),
    retryCount: configs.get("retry_count"),
  };
};
