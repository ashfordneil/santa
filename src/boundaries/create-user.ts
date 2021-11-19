import { Literal, Record, Static, String, Union } from 'runtypes';


export const CreateUserRequest = Record({
  name: String,
  token: String,
});

export type CreateUserRequest = Static<typeof CreateUserRequest>;

export const CreateUserResponse = Union(
  Record({
    success: Literal(true),
  }),
  Record({
    success: Literal(false),
    reason: String
  })
)

export type CreateUserResponse = Static<typeof CreateUserResponse>;