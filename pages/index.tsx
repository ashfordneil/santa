import React from 'react';
import { withIronSessionSsr } from 'iron-session/next';
import { InferGetServerSidePropsType } from 'next';

import { IronConfig } from 'config';
import { getDb } from 'migrations';

export const getServerSideProps = withIronSessionSsr(async (ctx) => {
  const user = ctx.req.session.id;
  if (user === undefined) {
    return { redirect: { destination: '/create-user', permanent: false } };
  }

  const db = getDb();
  const { name }: { name: string } = db.prepare('SELECT name FROM Users WHERE id = ?').get(user);
  return { props: { name } };
}, IronConfig);

const Home: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => (
  <main>
    <h1>Welcome to secret santa, {props.name}</h1>
  </main>
);

export default Home;