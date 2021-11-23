import { withIronSessionSsr } from 'iron-session/next';
import { GetServerSidePropsResult } from 'next';
import Link from 'next/link';
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

import { IronConfig } from 'config';
import { getDb } from 'migrations';

import styles from '../../styles/GroupView.module.css';

interface Props {
  readonly [key: string]: unknown;

  readonly userName: string;
  readonly name: string;
  readonly buyingFor: null | {
    readonly name: string;
    readonly wishList: string;
    readonly lastUpdated: number;
  } | {
    readonly name: string;
    readonly wishList: null;
  };
}

export const getServerSideProps = withIronSessionSsr(async (ctx): Promise<GetServerSidePropsResult<Props>> => {
  const user = ctx.req.session.id;
  if (user === undefined) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  const db = getDb();
  const getName: undefined | { name: string } = db.prepare('SELECT name FROM Users WHERE id = ?').get(user);
  if (getName === undefined) {
    ctx.req.session.destroy();
    return { redirect: { destination: '/login', permanent: false } };
  }

  const { group } = ctx.query as { group: string };

  const groupInfo: undefined | { name: string, current_year: number | null } = db.prepare('SELECT name, current_year FROM GiftExchangeGroup WHERE id = ?').get(group);
  if (groupInfo === undefined) {
    return { notFound: true };
  }

  const baseProps = { userName: getName.name, name: groupInfo.name };

  if (groupInfo.current_year === null) {
    return { props: { ...baseProps, buyingFor: null } };
  }

  const buyingFor: undefined | { name: string, wish_list: string | null, list_last_updated: number | null } = db.prepare(
    `SELECT u1.name, u1.wish_list, u1.list_last_updated
     FROM Users as u1
     INNER JOIN Gift ON Gift.receiver = u1.id
     WHERE Gift.giver = ? AND Gift.year = ? AND Gift.gift_exchange_group = ?
     LIMIT 1`
  ).get(user, groupInfo.current_year, group);

  if (buyingFor === undefined) {
    console.warn(`User ${user} unable to find who they are buying for in group ${groupInfo.name} (year ${groupInfo.current_year})`);
    return { props: { ...baseProps, buyingFor: null } };
  }

  if (buyingFor.wish_list === null || buyingFor.list_last_updated === null) {
    return { props: { ...baseProps, buyingFor: { name: buyingFor.name, wishList: null } } };
  } else {
    return {
      props: {
        ...baseProps,
        buyingFor: { name: buyingFor.name, wishList: buyingFor.wish_list, lastUpdated: buyingFor.list_last_updated }
      }
    };
  }
}, IronConfig);

const Body: React.FC<Props> = props => {
  if (props.buyingFor === null) {
    return (
      <p>Secret Santa allocation has not yet happened for this group. Please contact an administrator.</p>
    );
  }

  const name = <p>The name you have drawn for Secret Santa this year is <strong>{props.buyingFor.name}!</strong></p>;

  if (props.buyingFor.wishList === null) {
    return (
      <>
        {name}
        <p>They have not yet submitted their wishlist.</p>
      </>
    );
  }

  const date = new Date(props.buyingFor.lastUpdated);
  date.setMonth(4);
  const distance = formatDistanceToNow(date);

  return (
    <>
      {name}
      <p>This is what they want for Christmas:</p>
      <p className={styles.warning}>Warning: this wishlist was last edited {distance} ago.</p>
      <div dangerouslySetInnerHTML={{ __html: props.buyingFor.wishList }} />
    </>
  )
};

const GroupView: React.FC<Props> = props => {
  return (
    <div className={styles.view}>
      <h1>Welcome to Secret Santa, {props.userName}</h1>
      <p className={styles.warning}>Are you not {props.userName}? Click <Link href="/logout">here to log out!</Link></p>
      <h2>You have been invited to the {props.name} Secret Santa group</h2>
      <Body {...props} />
      <div className={styles.spacer}/>
      <p>Click <Link href="/">here to go back!</Link></p>
    </div>
  );
};

export default GroupView;