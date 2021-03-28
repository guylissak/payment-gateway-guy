// api/charge Payload interface

export interface IChargePayload {
  fullName: string;
  creditCardNumber: string;
  creditCardCompany: string;
  expirationDate: string;
  cvv: string;
  amount: number;
}

// api/charge optional response interface
export interface IChargeResponse {
  error: string;
}

// api/charge and api/chargeStatuses headers
export interface IChargeHeaders {
  ["merchant-identifier"]: string;
}

export enum CreditCardCompanyEnum {
  VISA = "visa",
  MASTERCARD = "mastercard",
}

export interface IVisaRequest {
  fullName: string;
  number: string;
  expiration: string;
  cvv: string;
  totalAmount: number;
}

export interface IVisaResponse {
  chargeResult: string;
  resultReason: string;
}

export interface IMasterCardRequest {
  first_name: string;
  last_name: string;
  card_number: string;
  expiration: string;
  cvv: string;
  charge_amount: number;
}

export interface IMasterCardResponse {
  decline_reason?: string;
}

export interface ICreditCardCompanyHeader {
  key: string;
  value: string;
}
