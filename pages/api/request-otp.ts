import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiResponse } from 'next';
import { randomInt } from 'crypto';

import { IronConfig } from 'config';
import { seal } from 'boundaries/signed-otp-request';
import { RequestOtpRequest, RequestOtpResponse } from 'boundaries/request-otp';

const generateOtp = (): string => {
  const output = [];
  for (let i = 0; i < 6; i++) {
    output.push(randomInt(10));
  }

  return output.join('');
};

const Route = withIronSessionApiRoute(async (req, res: NextApiResponse<string | RequestOtpResponse>) => {
  if (req.session.id !== undefined) {
    res.status(403).setHeader('content-type', 'text/plain; charset=UTF-8').send('Already logged in');
    return;
  }

  if (req.method !== 'POST' || req.headers['content-type'] !== 'application/json') {
    res.status(405).send('Method not allowed');
    return;
  }

  if (!RequestOtpRequest.guard(req.body)) {
    res.status(400).send('Invalid POST body');
    return;
  }

  const desiredOtp = generateOtp();
  console.log(`Tell the owner of ${req.body.phone} that their OTP is ${desiredOtp}`);

  const token = await seal({ phone: req.body.phone, desired_otp: desiredOtp });

  res.status(200).json({ token });
}, IronConfig);

export default Route;