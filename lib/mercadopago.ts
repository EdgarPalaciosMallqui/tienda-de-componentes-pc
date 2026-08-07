import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

export function getMpClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  });
}

export function getMpPreference() {
  return new Preference(getMpClient());
}

export function getMpPayment() {
  return new Payment(getMpClient());
}
