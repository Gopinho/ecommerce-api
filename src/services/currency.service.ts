import axios from 'axios';

const API_URL = 'https://api.frankfurter.app/latest';

export async function convertCurrency(amount: number, from: string, to: string) {
  from = from.toUpperCase();
  to = to.toUpperCase();
  const res = await axios.get(API_URL, {
    params: { amount, from, to }
  });
  const rates = res.data.rates;
  if (!rates || !rates[to]) throw new Error('currency.invalid_pair');
  return { amount: rates[to], rate: rates[to] / amount };
}