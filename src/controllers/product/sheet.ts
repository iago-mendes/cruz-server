import {Request, Response} from 'express'
import path from 'path'
import Company, {CompanyType, Product} from '../../models/Company'
import {getDate} from '../../utils/getDate'

const productHeader: Array<{
	name: string
	field: string
}> = require(path.resolve('db', 'sheets', 'productHeader.json'))

function getFullHeader(company: CompanyType) {
	const tables = company.tabelas
	const fullHeader = [...productHeader]

	tables.map(table => {
		fullHeader.push({
			name: `Tabela ${table.nome}`,
			field: String(table._id)
		})
	})

	return fullHeader
}

function getFieldName(field: string) {
	const column = productHeader.find(column => column.field === field)
	if (!column) return ''

	return column.name
}

const productSheet = {
	getHeader: async (req: Request, res: Response) => {
		const {company: companyId} = req.params

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})

		const fullHeader = getFullHeader(company)
		const header = fullHeader.map(({name}) => name)

		return res.json(header)
	},

	getProducts: async (req: Request, res: Response) => {
		const {company: companyId} = req.params

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})

		const fullHeader = getFullHeader(company)

		const productsSheet = company.produtos.map(product => {
			const tmpProductSheet: {
				[fieldName: string]: string | number
			} = {}

			fullHeader.map(({field, name}) => {
				if (name.split(' ')[0] === 'Tabela') {
					const table = product.tabelas.find(({id}) => id == field)
					if (table) tmpProductSheet[name] = table.preco
				} else {
					const value = product[field as keyof Product]
					if (typeof value === 'string' || typeof value === 'number')
						tmpProductSheet[name] = value
				}
			})

			return tmpProductSheet
		})

		return res.json(productsSheet)
	},

	setProducts: async (req: Request, res: Response) => {
		const {company: companyId} = req.params
		const {
			header,
			data: sheetProducts
		}: {
			header: string[]
			data: Array<{
				[fieldName: string]: string | number
			}>
		} = req.body

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})

		const fullHeader = getFullHeader(company)
		if (header.length !== fullHeader.length)
			return res
				.status(400)
				.json({message: 'Planilha inválida! Número de colunas incorreto!'})

		let isValid = true
		fullHeader.map(({name}, index) => {
			if (header[index] !== name) isValid = false
		})
		if (!isValid)
			return res
				.status(400)
				.json({message: 'Planilha inválida! Descrição de colunas incorreta!'})

		interface Table {
			id: string
			preco: number
		}
		const products = company.produtos

		sheetProducts.map(sheetProduct => {
			const tables: Table[] = []

			fullHeader.map(({name: fieldName, field}) => {
				if (fieldName.split(' ')[0] === 'Tabela')
					tables.push({
						id: field,
						preco: Number(sheetProduct[fieldName])
					})
			})

			const product = {
				codigo: String(sheetProduct[getFieldName('codigo')]),
				nome: String(sheetProduct[getFieldName('nome')]),
				comissao: Number(sheetProduct[getFieldName('comissao')]),
				unidade: String(sheetProduct[getFieldName('unidade')]),
				peso: Number(sheetProduct[getFieldName('peso')]),
				volume: Number(sheetProduct[getFieldName('volume')]),
				ipi: Number(sheetProduct[getFieldName('ipi')]),
				st: Number(sheetProduct[getFieldName('st')]),
				tabelas: tables
			}

			const previousIndex = products.findIndex(
				({codigo}) => String(codigo) === String(product.codigo)
			)
			if (previousIndex < 0)
				products.push({
					imagem: undefined,
					...product
				})
			else
				products[previousIndex] = {
					imagem: products[previousIndex].imagem,
					...product
				}
		})

		await Company.findByIdAndUpdate(company._id, {
			produtos: products,
			modificadoEm: getDate()
		})

		return res.status(201).send()
	}
}

export default productSheet
