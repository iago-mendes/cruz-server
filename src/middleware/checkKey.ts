import {Request, Response, NextFunction} from 'express'

export default function checkKey(req: Request, res: Response, next: NextFunction)
{
	const frontKey = req.headers['key']
	const key = process.env.KEY

	if (!frontKey)
		return res.status(403).json({message: 'No key provided!'})
	else if (String(frontKey) !== String(key))
		return res.status(403).json({message: 'Provided key is invalid!'})
	else
		return next()
}