import { withIronSessionSsr } from 'iron-session/next';

import { IronConfig } from 'config';

export const getServerSideProps = withIronSessionSsr(async (ctx) => {
  const user = ctx.req.session.id;
  if (user !== undefined) {
    ctx.req.session.destroy();
  }

  return { redirect: { destination: '/login', permanent: false } };
}, IronConfig);

export default () => null;