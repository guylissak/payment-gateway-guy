import * as Hapi from "@hapi/hapi";
import { IChargePayload, CreditCardCompanyEnum, IChargeHeaders } from "./interfaces";
import { loggerFactory } from "../../logging";

const logger = loggerFactory("Validator");

// Validate years range
const isValidYear = (year: number): boolean => {
  return year >= 0 && year <= 99;
};

// Validate months range
const isValidMonth = (month: number): boolean => {
  return month >= 1 && month <= 12;
};

// Validate expiration date format MM/YY
const validateExpirationDateFormat = (expDate: string): boolean => {
  if (expDate.length !== 5 || expDate[2] !== "/") {
    return false;
  }

  const month = Number(expDate.split("/")[0]);
  const year = Number(expDate.split("/")[1]);

  if (!isFinite(month) || !isValidMonth(month)) {
    return false;
  }

  if (!isFinite(year) || !isValidYear(year)) {
    return false;
  }

  return true;
};

// Validate credit card number format
const validateCreditCardNumber = (ccNumber: string): boolean => {
  return isFinite(Number(ccNumber)) && ccNumber.length === 16 && Number(ccNumber) > 0;
};

// Validate credit card company
const validateCreditCardCompany = (ccCompany: string): boolean => {
  switch (ccCompany) {
    case CreditCardCompanyEnum.MASTERCARD:
    case CreditCardCompanyEnum.VISA:
      return true;
    default:
      return false;
  }
};

// Validate full name
const validateFullName = (fullName: string): boolean => {
  return fullName !== "";
};

// Validate cvv
const validateCvv = (cvv: string): boolean => {
  return cvv.length === 3 && isFinite(Number(cvv)) && Number(cvv) > 0;
};

// Validate charge amount
const validateAmount = (amount: number): boolean => {
  return amount > 0;
};

// api/charge payload validator
export const validateChargePayload = async (payload: IChargePayload) => {
  let isValid = true;

  if (typeof payload.fullName !== "string" || validateFullName(payload.fullName) === false) {
    logger.error("invalid full name");
    isValid = false;
  }

  if (
    (isValid && typeof payload.creditCardNumber !== "string") ||
    validateCreditCardNumber(payload.creditCardNumber) === false
  ) {
    logger.error("invalid credit card number");
    isValid = false;
  }

  if (
    (isValid && typeof payload.creditCardCompany !== "string") ||
    validateCreditCardCompany(payload.creditCardCompany) === false
  ) {
    logger.error("invalid credit card company");
    isValid = false;
  }

  if ((isValid && typeof payload.cvv !== "string") || validateCvv(payload.cvv) === false) {
    logger.error("invalid cvv");
    isValid = false;
  }

  if ((isValid && typeof payload.amount !== "number") || validateAmount(payload.amount) === false) {
    logger.error("invalid amount");
    isValid = false;
  }

  if (
    (isValid && typeof payload.expirationDate !== "string") ||
    validateExpirationDateFormat(payload.expirationDate) === false
  ) {
    logger.error("invalid expire date");
    isValid = false;
  }

  if (!isValid) {
    throw new Error("payment gateway payload validation error");
  }
};

// Validate headers
export const validateChargeHeaders = async (headers: IChargeHeaders) => {
  if (!headers["merchant-identifier"] || typeof headers["merchant-identifier"] !== "string") {
    logger.error("invalid headers");
    throw new Error("payment gateway headers validation error");
  }
};

// Custom implementation to handle errors
export const requestErrorHandler = (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  return h.response().code(400).takeover();
};
