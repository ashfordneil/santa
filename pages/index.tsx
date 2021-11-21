import React from 'react';
import { withIronSessionSsr } from 'iron-session/next';
import { InferGetServerSidePropsType } from 'next';
import Link from 'next/link';

import { IronConfig } from 'config';
import { getDb } from 'migrations';

export const getServerSideProps = withIronSessionSsr(async (ctx) => {
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
  return { props: { name: result.name } };
}, IronConfig);

const Home: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => (
  <main>
    <h1>Welcome to Secret Santa, {props.name}</h1>
    <p>Are you not {props.name}? Click <Link href='/logout'>here to log out</Link></p>
  </main>
);

export default Home;