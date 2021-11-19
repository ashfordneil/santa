import { Literal, Record, Static, String, Union } from 'runtypes';

export const SubmitOtpRequest = Record({
  otp: String,
  token: String
});

export type SubmitOtpRequest = Static<typeof SubmitOtpRequest>;

export const SubmitOtpResponse = Union(
  Record({
    userExists: Literal(false),
    verifiedPhoneToken: String
  }),
  Record({
    userExists: Literal(true)
  })
);

export type SubmitOtpResponse = Static<typeof SubmitOtpResponse>;
