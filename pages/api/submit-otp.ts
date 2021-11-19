import { timingSafeEqual } from 'crypto';
import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiResponse } from 'next';

import { seal } from 'boundaries/signed-otp-confirmation';
import { unseal } from 'boundaries/signed-otp-request';
import { SubmitOtpRequest, SubmitOtpResponse } from 'boundaries/submit-otp';
import { IronConfig } from 'config';
import { getDb } from 'migrations';

const Route = withIronSessionApiRoute(async (req, res: NextApiResponse<string | SubmitOtpResponse>) => {
  if (req.session.id !== undefined) {
    res.status(403).send('Already logged in');
    return;
  }

  if (req.method !== 'POST' || req.headers['content-type'] !== 'application/json') {
    res.status(405).send('Method not allowed');
    return;
  }

  if (!SubmitOtpRequest.guard(req.body)) {
    res.status(400).send('Invalid POST body');
    return;
  }

  const decoded = await unseal(req.body.token).then(body => body, () => undefined);
  if (!decoded) {
    res.status(400).send('Invalid token');
    return;
  }

  if (!timingSafeEqual(Buffer.from(decoded.desired_otp, 'hex'), Buffer.from(req.body.otp, 'hex'))) {
    res.status(400).setHeader('content-type', 'text/plain; charset=UTF-8').send('The OTP is incorrect');
    return;
  }

  const db = getDb();
  const query: { id: number } | undefined = db.prepare('SELECT id FROM Users WHERE phone_number = ?').get(decoded.phone);

  if (query) {
    req.session.id = query.id;
    await req.session.save();
    res.status(200).send({ userExists: true })
  } else {
    const token = await seal({ phone: decoded.phone });
    res.status(200).send({ userExists: false, verifiedPhoneToken: token });
  }
}, IronConfig);

export default Route;