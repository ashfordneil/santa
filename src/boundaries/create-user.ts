import { Record, Static, String } from 'runtypes';

export const CreateUserRequest = Record({
  token: String,
  otp: String
});

export type CreateUserRequest = Static<typeof CreateUserRequest>;