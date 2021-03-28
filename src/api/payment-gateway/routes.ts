import * as Hapi from "@hapi/hapi";
import { IConfigurations } from "../../configurations";
import PaymentGateway from "./payment-gateway";
import * as validation from "./validation";

export default (server: Hapi.Server, config: IConfigurations) => {
  const paymentGateway = new PaymentGateway(config);
  server.bind(paymentGateway);

  // api/charge
  server.route({
    method: "POST",
    path: "/api/charge",
    options: {
      handler: paymentGateway.charge,
      validate: {
        payload: validation.validateChargePayload,
        headers: validation.validateChargeHeaders,
        failAction: validation.requestErrorHandler,
      },
    },
  });

  // api/chargeStatuses
  server.route({
    method: "GET",
    path: "/api/chargeStatuses",
    options: {
      handler: paymentGateway.getStatus,
      validate: {
        headers: validation.validateChargeHeaders,
        failAction: validation.requestErrorHandler,
      },
    },
  });
};
