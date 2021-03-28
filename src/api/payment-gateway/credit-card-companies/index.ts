import Visa from "./visa";
import Mastercard from "./mastercard";
import CreditCardCompany from "./company";
import { CreditCardCompanyEnum } from "../interfaces";

export const getCreditCardCompanyInstance = (company: string): CreditCardCompany => {
  switch (company) {
    case CreditCardCompanyEnum.VISA:
      return new Visa();
    case CreditCardCompanyEnum.MASTERCARD:
      return new Mastercard();
    default:
      throw new Error("Invalid credit card company");
  }
};
