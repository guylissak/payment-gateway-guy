import * as Hapi from "@hapi/hapi";
import { IChargePayload, IChargeResponse } from "./interfaces";
import CreditCardCompany from "./credit-card-companies/company";
import { getCreditCardCompanyInstance } from "./credit-card-companies";
import { sleep } from "../../utils";
import { updateDatabase, getRecordFromDatabase } from "./local-database";
import { IConfigurations } from "../../configurations";
import { loggerFactory, CustomLogger } from "../../logging";

export default class PaymentGateway {
  private config: IConfigurations;
  private logger: CustomLogger;

  constructor(config: IConfigurations) {
    this.config = config;
    this.logger = loggerFactory("Payment-Gateway");
  }

  // @route - <baseUrl>/api/charge
  // @description - given customer details and merchants identifier charges the credit card against credit card companies via API
  public charge = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    try {
      const {
        fullName,
        creditCardNumber,
        creditCardCompany,
        expirationDate,
        cvv,
        amount,
      } = request.payload as IChargePayload;

      const merchantIdentifier = request.headers["merchant-identifier"];

      this.logger.info(`New request has received:
        fullName - ${fullName},
        creditCardNumber - ${creditCardNumber},
        creditCardCompany - ${creditCardCompany},
        expirationDate - ${expirationDate},
        cvv - ${cvv},
        amount - ${amount},
        merchantIdentifier - ${merchantIdentifier}`);

      // Create instance of credit card company class (abstract class)
      const ccCompany = getCreditCardCompanyInstance(creditCardCompany);
      const companyName = ccCompany.getCompanyName();
      this.logger.info(`Start charging request for ${companyName}`);

      // Charge credit card using retry approach
      const [responseObj, statusCode] = await this.withRetry(
        request.payload as IChargePayload,
        ccCompany,
        merchantIdentifier
      );

      // In case of business error, always return "Card Declined"
      if (responseObj && responseObj.error) {
        responseObj.error = "Card Declined";
      }

      this.logger.info("Finished request");
      return h.response(responseObj ? responseObj : null).code(statusCode);
    } catch (err) {
      this.logger.error(`An internal error ocurred ${err}`);
      return h.response().code(500);
    }
  };

  // @route - <baseUrl>/api/chargeStatuses
  // @description - get list of declined reasons with their count for merchant identifier
  public getStatus = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    try {
      const identifier = request.headers["merchant-identifier"];
      // Access local database and fetch the record for the identifer
      const record: { string: number } = getRecordFromDatabase(identifier);
      return h.response(record ? record : null).code(200);
    } catch (err) {
      this.logger.error(`An internal error ocurred ${err}`);
      return h.response().code(500);
    }
  };

  // @description - Implementation of retry mechanism
  private withRetry = async (
    payload: IChargePayload,
    companyInst: CreditCardCompany,
    identifier: string
  ): Promise<[IChargeResponse, number]> => {
    let responseObject = null;
    let statusCode = 200;

    for (let i = 1; i <= this.config.retryCount; i++) {
      // Perform charge card operation against a credit card company
      const [responseObj, code] = await companyInst.chargeCard(payload);
      responseObject = { ...responseObj };
      statusCode = code;

      // if we got a declined reason, update in local db
      if (responseObj && responseObj.error) {
        updateDatabase(responseObj.error, identifier);
      }

      if (code === 500 || (responseObj && companyInst.shouldRetry(responseObj.error))) {
        // Check if retry is needed (business error which is NOT "insufficient fund" or if we got an internal error from the company API)
        // in case of 200 status code or 40x status code without business error there's no point to retry
        this.logger.info(`Will retry to charge company in ${i ** 2} seconds`);
        await sleep(i ** 2);
      } else {
        return [responseObj, code];
      }
    }

    // In case max retry count has happened, need to return the latest response object and status code, since
    // the responseObj and code are not in same scope, code looks cleaner to update these variable each response.
    return [responseObject, statusCode];
  };
}
