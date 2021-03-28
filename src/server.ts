import * as Hapi from "@hapi/hapi";
import * as paymentGateway from "./api/payment-gateway";
import { IConfigurations } from "./configurations";
import { loggerFactory } from "./logging";

const logger = loggerFactory("Server");

export const init = async (config: IConfigurations): Promise<Hapi.Server> => {
  const port = config.serverPort;
  const server = new Hapi.Server({
    port,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  logger.info("Register Routes");
  paymentGateway.init(server, config);

  logger.info("Routes registered successfully.");

  return server;
};
