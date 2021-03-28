import {
  IChargePayload,
  IMasterCardResponse,
  IChargeResponse,
  IMasterCardRequest,
  CreditCardCompanyEnum,
} from "../interfaces";
import CreditCardCompany from "./company";
import { loggerFactory, CustomLogger } from "../../../logging";

// Mastercard Implementation of CreditCardCompany
export default class Mastercard extends CreditCardCompany {
  private logger: CustomLogger;

  constructor() {
    super();
    this.logger = loggerFactory("MASTERCARD");
  }

  // getCompanyName - return the company name
  public getCompanyName = () => {
    return CreditCardCompanyEnum.MASTERCARD;
  };

  // chargeCard - Mastercard implementation of chargeCard
  public chargeCard = async (payload: IChargePayload): Promise<[IChargeResponse, number]> => {
    // Build new payload according to visa format

    const firstName = payload.fullName.split(" ")[0];
    // for cases of middle name
    const lastName = payload.fullName.split(" ").pop();
    const mastercardPayload: IMasterCardRequest = {
      first_name: firstName,
      last_name: lastName,
      card_number: payload.creditCardNumber,
      expiration: payload.expirationDate.replace("/", "-"),
      cvv: payload.cvv,
      charge_amount: payload.amount,
    };

    this.logger.debug(`send payload ${mastercardPayload} to mastercard API`);

    const config = this.getHeaders([{ key: "identifier", value: firstName }]);
    try {
      await this.submit("https://interview.riskxint.com/mastercard/capture_card", mastercardPayload, config);

      return this.handleResponse(200);
    } catch (err) {
      const result = err.response.data && err.response.data;
      return this.handleResponse(err.response.status, result);
    }
  };

  // ShouldRetry - returns true if the reason is not insufficient funds
  public shouldRetry = (errorMessage: string) => {
    return errorMessage !== "Insufficient funds";
  };

  // handleResponse - Mastercard implementation of handleResponse, has private impl since the logic is different
  protected handleResponse = (code: number, result?: IMasterCardResponse): [IChargeResponse, number] => {
    // console.log(result);
    let reason = null;
    if (code === 400 && result && result.decline_reason) {
      reason = result.decline_reason;
    }

    return this.generateResponse(code, reason);
  };
}
