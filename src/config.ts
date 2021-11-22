import { IronSessionOptions } from 'iron-session';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { Record, Static, String } from 'runtypes';

const ConfigurationSchema = Record({
  DATABASE_PATH: String,
  COOKIE_PASSWORD: String.withConstraint(pass => pass.length >= 32 || 'Password must be at least 32 characters'),
  SEAL_PASSWORD: String.withConstraint(pass => pass.length >= 32 || 'Password must be at least 32 characters'),
  TWILIO_ACCOUNT_SID: String,
  TWILIO_AUTH_TOKEN: String,
  TWILIO_PHONE_NUMBER: String.withConstraint(ph => isValidPhoneNumber(ph))
});

export type Config = Static<typeof ConfigurationSchema>;

const storedConfig = ConfigurationSchema.check(process.env);

export const getConfig = <K extends keyof Config>(key: K): Config[K] => storedConfig[key];

export const IronConfig: IronSessionOptions = {
  password: getConfig('COOKIE_PASSWORD'),
  cookieName: 'seal'
};