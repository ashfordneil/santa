import { Record, Static, String } from 'runtypes';
import * as Iron from '@hapi/iron';
import { getConfig } from '../config';

const SignedOtpRequest = Record({
  name: String,
  phone: String,
  desired_otp: String
});

export type SignedOtpRequest = Static<typeof SignedOtpRequest>;

export const seal = (req: SignedOtpRequest): Promise<string> =>
  Iron.seal(req, getConfig('SEAL_PASSWORD'), Iron.defaults);

export const unseal = async (input: string): Promise<SignedOtpRequest> => {
  const raw = await Iron.unseal(input, getConfig('SEAL_PASSWORD'), Iron.defaults);
  return SignedOtpRequest.check(raw);
};