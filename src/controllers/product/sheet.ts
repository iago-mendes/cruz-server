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
	let fullHeader = [...productHeader]

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

function getFieldName(field: string)
{
	const column = productHeader.find(column => column.field === field)
	if (!column)
		return ''
	
	return column.name
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
		const {company: companyId} = req.params
		const {header, data: sheetProducts}:
		{
			header: string[]
			data: Array<
			{
				[fieldName: string]: string | number
			}>
		} = req.body

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})
		
		const fullHeader = getFullHeader(company)
		if (header.length !== fullHeader.length)
			return res.status(400).json({message: 'Planilha inválida! Número de colunas incorreto!'})
		
		let isValid = true
		fullHeader.map(({name}, index) =>
		{
			if (header[index] !== name)
				isValid = false
		})
		if (!isValid)
			return res.status(400).json({message: 'Planilha inválida! Descrição de colunas incorreta!'})

		interface Table
		{
			id: string
			preco: number
		}
		let products = company.produtos

		sheetProducts.map(sheetProduct =>
		{
			let tables: Table[] = []
			
			fullHeader.map(({name: fieldName, field}) =>
			{
				if (fieldName.split(' ')[0] === 'Tabela')
					tables.push(
					{
						id: field,
						preco: Number(sheetProduct[fieldName])
					})
			})

			products.push(
			{
				imagem: undefined,
				codigo: Number(sheetProduct[getFieldName('codigo')]),
				nome: String(sheetProduct[getFieldName('nome')]),
				comissao: Number(sheetProduct[getFieldName('comissao')]),
				unidade: String(sheetProduct[getFieldName('unidade')]),
				peso: Number(sheetProduct[getFieldName('peso')]),
				volume: Number(sheetProduct[getFieldName('volume')]),
				ipi: Number(sheetProduct[getFieldName('ipi')]),
				st: Number(sheetProduct[getFieldName('st')]),
				tabelas: tables
			})
		})

		await Company.findByIdAndUpdate(company._id, {produtos: products})

		return res.status(201).send()
	}
}

export default productSheet