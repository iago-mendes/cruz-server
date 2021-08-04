import {Request, Response} from 'express'
import fs from 'fs'
import path from 'path'

import Company from '../../models/Company'
import Client from '../../models/Client'
import formatImage from '../../utils/formatImage'
import {getDate} from '../../utils/getDate'
import {handleObjectId} from '../../utils/handleObjectId'

const product = {
	create: async (req: Request, res: Response) => {
		const {company: companyId} = req.params
		const {
			_id,
			nome,
			unidade,
			ipi,
			st,
			tabelas,
			codigo,
			comissao,
			peso,
			volume
		} = req.body
		const image = req.file

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})
		const {produtos: products, relatedTables} = company

		let tables: Array<{
			id: string
			preco: number
		}> = !tabelas ? [] : JSON.parse(tabelas)
		const relatedTablesIds = !relatedTables
			? []
			: relatedTables.map(table => table.id)

		if (tabelas) {
			tables.sort((a, b) => {
				const isARelated = relatedTablesIds.includes(a.id)
				const isBRelated = relatedTablesIds.includes(b.id)

				if (isARelated && !isBRelated) return 1
				else if (!isARelated && isBRelated) return -1
				else return 0
			})

			tables = tables.map(table => {
				if (!relatedTables) return table

				const relatedTable = relatedTables.find(({id}) => id === table.id)
				if (!relatedTable) return table

				const targetTable = tables.find(({id}) => id === relatedTable.target)
				if (!targetTable) return table

				return {
					id: table.id,
					preco: targetTable.preco * relatedTable.relation
				}
			})
		}

		products.push({
			_id: handleObjectId(_id),
			imagem: image && image.filename,
			nome,
			unidade,
			ipi,
			st,
			tabelas: tables,
			codigo,
			comissao,
			peso,
			volume
		})

		await Company.findByIdAndUpdate(company._id, {
			produtos: products,
			modificadoEm: getDate()
		})
		return res.send()
	},

	update: async (req: Request, res: Response) => {
		const {company: companyId, product: productId} = req.params

		const {
			nome,
			unidade,
			ipi,
			st,
			tabelas,
			codigo,
			comissao,
			peso,
			volume,
			isBlocked
		} = req.body
		const image = req.file

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})
		const {produtos: products, relatedTables} = company

		const index = company.produtos.findIndex(
			product => String(product._id) == String(productId)
		)
		if (index < 0)
			return res.status(404).json({message: 'Produto não encontrado'})
		const previous = products[index]

		let tables: Array<{
			id: string
			preco: number
		}> = !tabelas ? previous.tabelas : JSON.parse(tabelas)
		const relatedTablesIds = !relatedTables
			? []
			: relatedTables.map(table => table.id)

		if (tabelas) {
			tables.sort((a, b) => {
				const isARelated = relatedTablesIds.includes(a.id)
				const isBRelated = relatedTablesIds.includes(b.id)

				if (isARelated && !isBRelated) return 1
				else if (!isARelated && isBRelated) return -1
				else return 0
			})

			tables = tables.map(table => {
				if (!relatedTables) return table

				const relatedTable = relatedTables.find(({id}) => id === table.id)
				if (!relatedTable) return table

				const targetTable = tables.find(({id}) => id === relatedTable.target)
				if (!targetTable) return table

				return {
					id: table.id,
					preco: targetTable.preco * relatedTable.relation
				}
			})
		}

		let imagem: string | undefined
		if (image) {
			imagem = image.filename
			if (previous.imagem)
				fs.unlinkSync(path.resolve('uploads', previous.imagem))
		} else if (previous.imagem) imagem = previous.imagem

		products[index] = {
			_id: previous._id,
			imagem,
			codigo: codigo ? codigo : previous.codigo,
			nome: nome ? nome : previous.nome,
			ipi: ipi ? ipi : previous.ipi,
			st: st ? st : previous.st,
			peso: peso ? peso : previous.peso,
			volume: volume ? volume : previous.volume,
			unidade: unidade ? unidade : previous.unidade,
			comissao: comissao ? comissao : previous.comissao,
			tabelas: tables,
			isBlocked: isBlocked != undefined ? isBlocked : previous.isBlocked
		}

		await Company.findByIdAndUpdate(company._id, {
			produtos: products,
			modificadoEm: getDate()
		})
		return res.send()
	},

	remove: async (req: Request, res: Response) => {
		const {company: companyId, product: productId} = req.params

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})
		const products = company.produtos

		const index = company.produtos.findIndex(
			product => String(product._id) == String(productId)
		)
		if (index < 0)
			return res.status(404).json({message: 'Produto não encontrado'})
		const removed = products[index]

		if (removed.imagem) fs.unlinkSync(path.resolve('uploads', removed.imagem))

		products.splice(index, 1)

		await Company.findByIdAndUpdate(company._id, {
			produtos: products,
			modificadoEm: getDate()
		})
		return res.send()
	},

	list: async (req: Request, res: Response) => {
		const {company: companyId} = req.params

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})

		const products = company.produtos.map(product => ({
			id: product._id,
			imagem: formatImage(product.imagem),
			nome: product.nome,
			unidade: product.unidade
		}))
		products.sort((a, b) => (a.nome < b.nome ? -1 : 1))

		return res.json(products)
	},

	listPriced: async (req: Request, res: Response) => {
		const {company: companyId} = req.params
		const {client: clientId} = req.query

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})

		const client = await Client.findById(clientId)
		if (!client) return res.json({message: 'Cliente não encontrado!'})

		const tableId = client.representadas.find(
			representada => String(representada.id) == String(company?._id)
		)?.tabela
		if (!tableId) return res.json({message: 'Tabela não encontrada!'})

		const products = company.produtos
			.filter(product => product.isBlocked !== true)
			.map(product => ({
				id: product._id,
				imagem: formatImage(product.imagem),
				nome: product.nome,
				unidade: product.unidade,
				st: product.st,
				ipi: product.ipi,
				preco: product.tabelas.find(
					tabela => String(tabela.id) == String(tableId)
				)?.preco
			}))
		products.sort((a, b) => (a.nome < b.nome ? -1 : 1))

		return res.json(products)
	},

	showPriced: async (req: Request, res: Response) => {
		const {company: companyId, product: productId} = req.params
		const {client: clientId} = req.query

		const company = await Company.findById(companyId)
		if (!company) return res.json({message: 'Representada não encontrada!'})

		const product = company.produtos.find(
			produto => String(produto._id) == String(productId)
		)
		if (!product) return res.json({message: 'Produto não encontrado!'})

		const client = await Client.findById(clientId)
		if (!client) return res.json({message: 'Cliente não encontrado!'})

		const clientCompany = client.representadas.find(
			representada => String(representada.id) == String(company._id)
		)
		if (!clientCompany)
			return res.json({message: 'Representada não disponível para o cliente!'})

		const tableId = clientCompany.tabela
		const table = product.tabelas.find(
			tabela => String(tabela.id) == String(tableId)
		)
		if (!table) return res.json({message: 'Tabela não encontrada!'})

		const show = {
			id: product._id,
			imagem: formatImage(product.imagem),
			nome: product.nome,
			unidade: product.unidade,
			ipi: product.ipi,
			st: product.st,
			preco: table.preco
		}

		return res.json(show)
	},

	show: async (req: Request, res: Response) => {
		const {company: companyId, product: productId} = req.params

		const company = await Company.findById(companyId)
		if (!company) return res.json({message: 'Representada não encontrada!'})

		const product = company.produtos.find(
			produto => String(produto._id) == String(productId)
		)
		if (!product) return res.json({message: 'Produto não encontrado!'})

		const show = {
			id: product._id,
			imagem: formatImage(product.imagem),
			nome: product.nome,
			codigo: product.codigo,
			unidade: product.unidade,
			ipi: product.ipi,
			st: product.st,
			tabelas: product.tabelas
		}

		return res.json(show)
	},

	raw: async (req: Request, res: Response) => {
		const {company: companyId} = req.params

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})

		const products = company.produtos.map(product => ({
			_id: product._id,
			imagem: formatImage(product.imagem),
			nome: product.nome,
			unidade: product.unidade,
			st: product.st,
			ipi: product.ipi,
			codigo: product.codigo,
			comissao: product.comissao,
			tabelas: product.tabelas
		}))

		return res.json(products)
	},

	rawOne: async (req: Request, res: Response) => {
		const {company: companyId, product: productId} = req.params

		const company = await Company.findById(companyId)
		if (!company) return res.json({message: 'Representada não encontrada!'})

		const product = company.produtos.find(
			produto => String(produto._id) == String(productId)
		)
		if (!product) return res.json({message: 'Produto não encontrado!'})

		product.imagem = formatImage(product.imagem)

		return res.json(product)
	}
}

export default product
