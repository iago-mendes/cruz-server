import {Request, Response} from 'express'

import RequestModel from '../models/Request'
import {createPdf} from '../services/pdf'

const pdf =
{
	general: async (req: Request, res: Response) =>
	{
		const {content} = req.body

		const pdf = await createPdf(content)
		
		return res.contentType('application/pdf').send(pdf)
	}
}

export default pdf