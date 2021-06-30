import {ErrorRequestHandler} from 'express'

import {handleDuplicateKeyError} from './duplicateKey'
import {handleValidationError} from './validation'

const errorHandler: ErrorRequestHandler = (err, req, res) => {
	console.error(err)

	if (err && err.name === 'ValidationError')
		return (err = handleValidationError(err, res))
	if (err && err.code && err.code == 11000)
		return (err = handleDuplicateKeyError(err, res))

	return res.status(500).json({message: 'Erro interno do servidor!'})
}

export default errorHandler
