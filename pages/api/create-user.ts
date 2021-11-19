import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiResponse } from 'next';

import { IronConfig } from 'config';
import { CreateUserRequest, CreateUserResponse } from 'boundaries/create-user';
import { unseal } from 'boundaries/signed-otp-confirmation';
import { getDb } from 'migrations';

const Route = withIronSessionApiRoute(async (req, res: NextApiResponse<string | CreateUserResponse>) => {
  if (req.session.id !== undefined) {
    res.status(403).send('Already logged in');
    return;
  }

  if (req.method !== 'POST' || req.headers['content-type'] !== 'application/json') {
    res.status(405).send('Method not allowed');
    return;
  }

  if (!CreateUserRequest.guard(req.body)) {
    res.status(400).send('Invalid POST body');
    return;
  }

  const decoded = await unseal(req.body.token).then(body => body, () => undefined);
  if (!decoded) {
    res.status(400).send('Invalid token');
    return;
  }

  const db = getDb();

  try {
    const { id }: { id: number } = db.prepare('INSERT INTO Users (name, phone_number) VALUES (?, ?) RETURNING id').get(req.body.name, decoded.phone);
    req.session.id = id;
    await req.session.save();

    res.status(200).send({ success: true });
  } catch (e) {
    res.status(200).send({ success: false, reason: 'A user with this phone number already exists' });
  }
}, IronConfig);

export default Route;
