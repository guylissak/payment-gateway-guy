import * as Hapi from "@hapi/hapi";
import * as server from "./server";
import { getConfig } from "./configurations";
import { loggerFactory } from "./logging";

const logger = loggerFactory("App");

// Catch unhandled unexpected exceptions
process.on("uncaughtException", (error: Error) => {
  console.log(`Uncaught exception ${error.message}`);
});

// Catch unhandled rejected promises
process.on("unhandledRejection", (reason: any) => {
  console.log(`Unhandled promise rejection ${JSON.stringify(reason)}`);
});

// Starting application server
(async () => {
  try {
    logger.info("App started");
    const config = getConfig();
    // Init Hapi server
    const hapiServer: Hapi.Server = await server.init(config);
    await hapiServer.start();
    logger.info(`App is running at: ${hapiServer.info.uri}`);
  } catch (err) {
    logger.error(`Error starting the server, exiting the app. Error: ${err.stack}`);
    process.exit(1);
  }
})();
