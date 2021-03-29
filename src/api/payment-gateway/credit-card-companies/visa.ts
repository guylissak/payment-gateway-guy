import { IChargePayload, IVisaRequest, IVisaResponse, IChargeResponse, CreditCardCompanyEnum } from "../interfaces";
import CreditCardCompany from "./company";
import { loggerFactory, CustomLogger } from "../../../logging";
import { getConfig } from "../../../configurations";

const FAILURE = "Failure";

// Visa implementation of CreditCardCompany
export default class Visa extends CreditCardCompany {
  private logger: CustomLogger;
  private visaUrl: string;

  constructor() {
    super();
    this.logger = loggerFactory("VISA");
    this.visaUrl = getConfig().companies.visaUrl;
  }

  // getCompanyName - return the company type Visa
  public getCompanyName = () => {
    return CreditCardCompanyEnum.VISA;
  };

  // chargeCard - Visa implementation of chargeCard
  public chargeCard = async (payload: IChargePayload): Promise<[IChargeResponse, number]> => {
    // Build new payload according to visa format

    const visaPayload: IVisaRequest = {
      fullName: payload.fullName,
      number: payload.creditCardNumber,
      expiration: payload.expirationDate,
      cvv: payload.cvv,
      totalAmount: payload.amount,
    };

    this.logger.info(`Send Visa payload ${visaPayload} to Visa API`);

    const firstName = payload.fullName.split(" ")[0];
    const config = this.getHeaders([{ key: "identifier", value: firstName }]);
    try {
      const result = await this.submit(this.visaUrl, visaPayload, config);
      return this.handleResponse(200, result.data);
    } catch (err) {
      console.log(err);
      return this.handleResponse(err.response.status);
    }
  };

  // shouldRetry - return true if decline reason from visa API is NOT insufficient funds
  public shouldRetry = (errorMessage: string) => {
    return errorMessage !== "Insufficient funds";
  };

  // handleResponse - Visa implementation of , has private impl since the logic is different
  protected handleResponse = (code: number, result?: IVisaResponse): [IChargeResponse, number] => {
    // console.log(result);
    let reason = null;
    if (code === 200 && result && result.chargeResult === FAILURE) {
      reason = result.resultReason;
    }

    return this.generateResponse(code, reason);
  };
}
