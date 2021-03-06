import {Request, Response} from 'express'

import {createPdf} from '../services/pdf'

const pdf =
{
	general: async (req: Request, res: Response) =>
	{
		const docDefinition =
		{
			content: 'This is a sample PDF printed with pdfMake'
		}

		createPdf('test.pdf', docDefinition)

		return res.send()
	}
}

export default pdf