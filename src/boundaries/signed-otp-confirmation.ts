import { Record, Static, String } from 'runtypes';
import * as Iron from '@hapi/iron';

import { getConfig } from 'config';

const SignedOtpConfirmation = Record({
  phone: String,
});

export type SignedOtpConfirmation = Static<typeof SignedOtpConfirmation>;

export const seal = (payload: SignedOtpConfirmation): Promise<string> =>
  Iron.seal(payload, getConfig('SEAL_PASSWORD'), Iron.defaults);

export const unseal = async (input: string): Promise<SignedOtpConfirmation> => {
  const raw = await Iron.unseal(input, getConfig('SEAL_PASSWORD'), Iron.defaults);
  return SignedOtpConfirmation.check(raw);
};