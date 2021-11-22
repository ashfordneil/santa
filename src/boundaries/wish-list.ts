import { Boolean, Record, Static, String } from 'runtypes';

export const WishListRequest = Record({
  html: String,
});

export type WishListRequest = Static<typeof WishListRequest>;

export const WishListResponse = Record({
  success: Boolean
});

export type WishListResponse = Static<typeof WishListResponse>;