import axios, { AxiosRequestConfig } from "axios";
import {
  CreditCardCompanyEnum,
  IChargePayload,
  ICreditCardCompanyHeader,
  IMasterCardResponse,
  IChargeResponse,
  IVisaResponse,
} from "../interfaces";

export default abstract class CreditCardCompany {
  // ChargeCard - submit order against a credit card company, each company class has it's own implementation
  public abstract chargeCard(payload: IChargePayload): Promise<[IChargeResponse, number]>;

  // shouldRetry - return true if the declined reason is NOT insufficient fund, each company class has it's own implementation, since
  // the string reason may be different
  public abstract shouldRetry(errorMessage: string): boolean;
  // getCompanyName - return the company instance name
  public abstract getCompanyName(): CreditCardCompanyEnum;

  // generateResponse - the response should have the same format, however each company class handle the logic differently.
  protected abstract handleResponse(
    code: number,
    result?: IVisaResponse | IMasterCardResponse
  ): [IChargeResponse, number];

  // submit - submit the order - access the company type API
  protected submit = async (url: string, body: any, config: AxiosRequestConfig) => {
    const result = await axios.post(url, body, config);
    return result;
  };

  // generateResponse - build response based on the error code and reason from sub class
  protected generateResponse = (code: number, reason: string): [IChargeResponse, number] => {
    if (reason) {
      // Declined for business reason
      return [
        {
          error: reason,
        },
        200,
      ];
    } else if (code === 200) {
      // Success
      return [null, 200];
    } else if (code >= 400 && code <= 451) {
      return [null, 400];
    }

    return [null, 500];
  };

  // getHeaders - Dynamically adds headers, based on the instance headers
  protected getHeaders = (headersArr: ICreditCardCompanyHeader[]): AxiosRequestConfig => {
    const headers: any = {};
    headers["Content-Type"] = "application/json";

    for (const header of headersArr) {
      headers[header.key] = header.value;
    }

    return { headers };
  };
}
