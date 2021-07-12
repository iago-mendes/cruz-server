import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'

export function checkAuth(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization

	if (!authHeader)
		return res.status(401).json({message: 'Nenhum token informado!'})

	const [, token] = authHeader.split(' ')

	if (token == process.env.ADMIN_TOKEN) return next()

	try {
		jwt.verify(token, String(process.env.AUTH_SECRET))
		return next()
	} catch (error) {
		return res.status(401).json({message: 'Token informado é inválido!'})
	}
}
