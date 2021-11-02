import { NextApiRequest, NextApiResponse } from 'next'

const Route = (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({ name: 'John Doe' })
}

export default Route;