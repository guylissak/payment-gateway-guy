import * as nconf from "nconf";
import * as path from "path";

// Read Configurations
const configs = new nconf.Provider()
  .env({ lowerCase: true, separator: "." })
  .file({ file: path.join(__dirname, `./config.dev.json`) });

export interface iCompaniesConfigurations {
  visaUrl: string;
  mastercardUrl: string;
}

export interface IConfigurations {
  serverPort: number;
  retryCount: number;
  companies: iCompaniesConfigurations;
}

const getCompaniesConfigurations = (): iCompaniesConfigurations => {
  return {
    visaUrl: configs.get("companies").visa_url,
    mastercardUrl: configs.get("companies").mastercard_url,
  };
};

export const getConfig = (): IConfigurations => {
  return {
    serverPort: configs.get("server_port"),
    retryCount: configs.get("retry_count"),
    companies: getCompaniesConfigurations(),
  };
};
