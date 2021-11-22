import { formatDistanceToNow } from 'date-fns';
import { GetServerSidePropsResult } from 'next';
import React from 'react';
import { withIronSessionSsr } from 'iron-session/next';
import Link from 'next/link';

import styles from '../styles/LandingPage.module.css';

import { IronConfig } from 'config';
import { getDb } from 'migrations';

interface Group {
  readonly name: string;
  readonly id: number;
}

interface Props {
  readonly [key: string]: unknown;

  readonly name: string;
  readonly lastUpdated: number;
  readonly groups: Group[];
}

export const getServerSideProps = withIronSessionSsr(async (ctx): Promise<GetServerSidePropsResult<Props>> => {
  const user = ctx.req.session.id;
  if (user === undefined) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const db = getDb();
  const result: undefined | { name: string, list_last_updated: number } = db.prepare('SELECT name, list_last_updated FROM Users WHERE id = ?').get(user);
  if (result === undefined) {
    ctx.req.session.destroy();
    return { redirect: { destination: '/login', permanent: false } };
  }

  const groups: Array<Group> = db.prepare(
    'SELECT GiftExchangeGroup.name, GiftExchangeGroup.id FROM GiftExchangeGroup, GroupMembership WHERE GroupMembership.user = ? AND GroupMembership.gift_exchange_group = GiftExchangeGroup.id'
  ).all(user);

  return { props: { name: result.name, lastUpdated: result.list_last_updated, groups } };
}, IronConfig);

const Home: React.FC<Props> = props => {
  const showGroups = props.groups.length === 0 ? (
    <p>You are not in any Secret Santa groups, contact an admin for assistance</p>
  ) : props.groups.length ===1 ? (
    <p>You are in the {props.groups[0].name} group. Go <Link href={'/group/' + props.groups[0].id}>here to view your group.</Link></p>
  ) : (
    <>
      <p>You are in the following Secret Santa groups:</p>
      <ul>
        {props.groups.map((group, i) => (
          <li key={i}><Link href={`/group/${group.id}`}>{group.name}</Link></li>
        ))}
      </ul>
      <p>Click a group to see who you are buying for in that group</p>
    </>
  );

  return (
    <main className={styles.main}>
      <h1>Welcome to Secret Santa, {props.name}</h1>
      <p className={styles.warning}>Are you not {props.name}? Click <Link href="/logout">here to log out!</Link></p>
      {showGroups}
      {props.lastUpdated !== null ? (
        <p>It has been {formatDistanceToNow(new Date(props.lastUpdated))} since you last edited your Wish List. Click <Link href="/wish-list">here to tell your Secret Santa what you want!</Link></p>
      ) : (
        <p>You have not yet edited your Wish List. Click <Link href="/wish-list">here to tell your Secret Santa what you want!</Link></p>
      )}
    </main>
  );
};

export default Home;