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
  readonly groups: Group[];
}

export const getServerSideProps = withIronSessionSsr(async (ctx): Promise<GetServerSidePropsResult<Props>> => {
  const user = ctx.req.session.id;
  if (user === undefined) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const db = getDb();
  const result: undefined | { name: string } = db.prepare('SELECT name FROM Users WHERE id = ?').get(user);
  if (result === undefined) {
    ctx.req.session.destroy();
    return { redirect: { destination: '/login', permanent: false } };
  }

  const groups: Array<Group> = db.prepare(
    'SELECT GiftExchangeGroup.name, GiftExchangeGroup.id FROM GiftExchangeGroup, GroupMembership WHERE GroupMembership.user = ? AND GroupMembership.gift_exchange_group = GiftExchangeGroup.id'
  ).all(user);

  return { props: { name: result.name, groups } };
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
          <li key={i}>{group.name}</li>
        ))}
      </ul>
    </>
  );

  return (
    <main className={styles.main}>
      <h1>Welcome to Secret Santa, {props.name}</h1>
      <p className={styles.warning}>Are you not {props.name}? Click <Link href="/logout">here to log out!</Link></p>
      {showGroups}
    </main>
  );
};

export default Home;