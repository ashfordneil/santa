import { withIronSessionApiRoute } from 'iron-session/next';
import { parsePhoneNumber } from 'libphonenumber-js';
import { NextApiResponse } from 'next';
import { randomInt } from 'crypto';

import { getConfig, IronConfig } from 'config';
import { seal } from 'boundaries/signed-otp-request';
import { RequestOtpRequest, RequestOtpResponse } from 'boundaries/request-otp';
import twilio from 'twilio';

const generateOtp = (): string => {
  const output = [];
  for (let i = 0; i < 6; i++) {
    output.push(randomInt(10));
  }

  return output.join('');
};

// Easy switch for debugging
const REAL_TEXT_MESSAGES = true;

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

  const phone = parsePhoneNumber(req.body.phone, 'AU').formatInternational();

  const desiredOtp = generateOtp();

  const client = twilio(getConfig('TWILIO_ACCOUNT_SID'), getConfig('TWILIO_AUTH_TOKEN'), { lazyLoading: true });
  if (REAL_TEXT_MESSAGES) {
    await client.messages.create({
      from: getConfig('TWILIO_PHONE_NUMBER'),
      to: phone,
      body: `Welcome to Secret Santa! Your login code is ${desiredOtp}.`
    });
  } else {
    console.log(`Tell the owner of ${phone} that their OTP is ${desiredOtp}`);
  }

  const token = await seal({ phone, desired_otp: desiredOtp });

  res.status(200).json({ token });
}, IronConfig);

export default Route;
