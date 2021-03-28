import Hapi from "@hapi/hapi";
import Routes from "./routes";
import { IConfigurations } from "../../configurations";

export const init = (server: Hapi.Server, config: IConfigurations) => {
  Routes(server, config);
};
