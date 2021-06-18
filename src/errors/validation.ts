import { Response } from 'express'

export function handleValidationError(err: any, res: Response<any>)
{
	const message = 'Há um erro de validação nos dados enviados! Confira se você preencheu tudo corretamente.'

	res.status(400).send({message})
}