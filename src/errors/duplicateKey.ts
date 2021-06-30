import {Response} from 'express'

export function handleDuplicateKeyError(err: any, res: Response<any>) {
	const field = Object.keys(err.keyValue)
	const message = `Um registro com campo ${field} já existe!`

	res.status(409).send({message, field})
}
