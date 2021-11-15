import { Record, Static, String } from 'runtypes';

export const RequestOtpRequest = Record({
  name: String,
  phone: String
});

export type RequestOtpRequest = Static<typeof RequestOtpRequest>;

export const RequestOtpResponse = Record({
  token: String
});

export type RequestOtpResponse = Static<typeof RequestOtpResponse>;