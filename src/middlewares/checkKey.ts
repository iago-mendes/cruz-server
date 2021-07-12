import {Request, Response, NextFunction} from 'express'

export default function checkKey(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const frontKey = req.headers['key']
	const key = process.env.KEY

	if (!frontKey)
		return res.status(403).json({message: 'Nenhuma chave informada!'})
	else if (String(frontKey) !== String(key))
		return res.status(403).json({message: 'Chave informada é inválida!'})
	else return next()
}
