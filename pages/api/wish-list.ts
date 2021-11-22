import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiResponse } from 'next';
import createDomPurify from 'dompurify';
import { JSDOM } from 'jsdom';

import { WishListResponse, WishListRequest } from 'boundaries/wish-list';
import { IronConfig } from 'config';
import { getDb } from 'migrations';

const Route = withIronSessionApiRoute(async (req, res: NextApiResponse<string | WishListResponse>) => {
  if (req.session.id === undefined) {
    res.status(403).setHeader('content-type', 'text/plain; charset=UTF-8').send('Authentication required');
    return;
  }

  if (req.method !== 'POST' || req.headers['content-type'] !== 'application/json') {
    res.status(405).send('Method not allowed');
    return;
  }

  if (!WishListRequest.guard(req.body)) {
    res.status(400).send('Invalid POST body');
    return;
  }

  const rawHtml = req.body.html;
  const { window } = new JSDOM();
  // @ts-ignore
  const DOMPurify = createDomPurify(window)
  const safeHtml = DOMPurify.sanitize(rawHtml);
  const now = Date.now();

  const db = getDb();
  db.prepare('UPDATE Users SET wish_list = ?, list_last_updated = ? WHERE id = ?').run(safeHtml, now, req.session.id);

  res.status(200).json({ success: true });
}, IronConfig);

export default Route;