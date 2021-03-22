import {Request, Response} from 'express'
import path from 'path'
import Company, {CompanyType} from '../../models/Company'

const productHeader: Array<
{
	name: string
	field: string
}> = require(path.resolve('db', 'sheets', 'productHeader.json'))

function getFullHeader(company: CompanyType)
{
	const tables = company.tabelas
	let fullHeader = productHeader

	tables.map(table =>
	{
		fullHeader.push(
		{
			name: `Tabela ${table.nome}`,
			field: String(table._id)
		})
	})

	return fullHeader
}

const productSheet =
{
	getHeader: async (req: Request, res: Response) =>
	{
		const {company: companyId} = req.params

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})
		
		const fullHeader = getFullHeader(company)
		const header = fullHeader.map(({name}) => name)

		return res.json(header)
	},

	getProducts: async (req: Request, res: Response) =>
	{
		return res.json([])
	},

	setProducts: async (req: Request, res: Response) =>
	{
		return res.send()
	}
}

export default productSheet