import {Request, Response} from 'express'
import fs from 'fs'
import path from 'path'

import Company from '../models/Company'
import Client from '../models/Client'
import formatImage from '../utils/formatImage'

const product =
{
	create: async (req: Request, res: Response) =>
	{
		const {company: companyId} = req.params
		const {nome, unidade, ipi, st, tabelas, codigo, comissao, peso, volume} = req.body
		let image = req.file

		let company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})

		let products = company.produtos
		products.push(
		{
			imagem: image && image.filename,
			nome,
			unidade,
			ipi,
			st,
			tabelas: JSON.parse(tabelas),
			codigo,
			comissao
		})

		await Company.findByIdAndUpdate(company._id, {produtos: products})
		return res.send()
	},

	update: async (req: Request, res: Response) =>
	{
		const {company: companyId, product: productId} = req.params

		const {nome, unidade, ipi, st, tabelas, codigo, comissao, peso, volume} = req.body
		let image = req.file

		let company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})
		let products = company.produtos

		const index = company.produtos.findIndex(product => String(product._id) == String(productId))
		if (index < 0)
			return res.status(404).json({message: 'Produto não encontrado'})
		const previous = products[index]

		let imagem: string | undefined
		if (image)
		{
			imagem = image.filename
			if (previous.imagem)
				fs.unlinkSync(path.join(__dirname, '..', '..', 'uploads', previous.imagem))
		}
		else if (previous.imagem)
			imagem = previous.imagem
		
		products[index] =
		{
			_id: previous._id,
			imagem,
			codigo : codigo || previous.codigo,
			nome : nome || previous.nome,
			ipi : ipi || previous.ipi,
			st : st || previous.st,
			unidade : unidade || previous.unidade,
			comissao : comissao || previous.comissao,
			tabelas: tabelas ? JSON.parse(tabelas) : previous.tabelas
		}

		await Company.findByIdAndUpdate(company._id, {produtos: products})
		return res.send()
	},

	remove: async (req: Request, res: Response) =>
	{
		const {company: companyId, product: productId} = req.params

		let company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})
		let products = company.produtos

		const index = company.produtos.findIndex(product => String(product._id) == String(productId))
		if (index < 0)
			return res.status(404).json({message: 'Produto não encontrado'})
		const removed = products[index]

		if (removed.imagem)
			fs.unlinkSync(path.join(__dirname, '..', '..', 'uploads', removed.imagem))
		
		products.splice(index, 1)

		await Company.findByIdAndUpdate(company._id, {produtos: products})
		return res.send()
	},

	list: async (req: Request, res: Response) =>
	{
		const {company: companyId} = req.params

		let company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})

		const products = company.produtos.map(product => (
		{
			id: product._id,
			imagem: formatImage(product.imagem),
			nome: product.nome,
			unidade: product.unidade
		}))

		return res.json(products)
	},

	listPriced: async (req: Request, res: Response) =>
	{
		try {
			const {id: companyId} = req.params
			const {client: clientId} = req.query

			const company = await Company.findById(companyId)
			if (!company)
				return res.json({message: 'company not found'})

			const client = await Client.findById(clientId)
			if (!client)
				return res.json({message: 'client not found'})

			const tableId = client.representadas.find(representada => String(representada.id) == String(company._id))?.tabela
			if (!tableId)
				return res.json({message: 'table not found'})

			let list:
			{
				id?: string
				imagem: string
				nome: string
				unidade: string
				st: number
				ipi: number
				preco?: number
				linhaId?: string
			}[] = []

			company.linhas.map(line => line.produtos.map(product =>
			{
				list.push(
				{
					id: product._id,
					imagem: formatImage(product.imagem),
					nome: product.nome,
					unidade: product.unidade,
					st: product.st,
					ipi: product.ipi,
					preco: product.tabelas.find(tabela => String(tabela.id) == String(tableId))?.preco,
					linhaId: line._id
				})
			}))

			return res.json(list)
		} catch (error) {
			next(error)
		}
	},

	showPriced: async (req: Request, res: Response) =>
	{
		try {
			const company = await Company.findById(req.params.id)
			if (!company) return res.json({message: 'company not found'})
			const line = company?.linhas.find(linha => linha._id == req.params.line)
			if (!line) return res.json({message: 'line not found'})
			const product = line.produtos.find(produto => produto._id == req.params.product)
			if (!product) return res.json({message: 'product not found'})

			const {client: clientId} = req.query
			const client = await Client.findById(clientId)
			if (!client) return res.json({message: 'client not found'})

			const tableId = client.representadas.find(representada => representada.id == company._id)?.tabela
			if (!tableId) return res.json({message: 'table not found'})

			const show =
			{
				id: product._id,
				imagem: formatImage(product.imagem),
				nome: product.nome,
				unidade: product.unidade,
				ipi: product.ipi,
				st: product.st,
				preco: product.tabelas.find(tabela => tabela.id == tableId)?.preco
			}

			return res.json(show)
		} catch (error) {
			next(error)
		}
	},

	show: async (req: Request, res: Response) =>
	{
			try {
					const company = await Company.findById(req.params.id)
					if (!company) return res.json({message: 'company not found'})
					const line = company?.linhas.find(linha => linha._id == req.params.line)
					if (!line) return res.json({message: 'line not found'})
					const product = line.produtos.find(produto => produto._id == req.params.product)
					if (!product) return res.json({message: 'product not found'})

					const show =
					{
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
			} catch (error) {
					next(error)
			}
	},

	raw: async (req: Request, res: Response) =>
	{
		const {id: companyId, line: lineId} = req.params

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'company not found!'})

		const line = company.linhas.find(linha => linha._id == lineId)
		if (!line)
			return res.status(404).json({message: 'line not found!'})

		const products = line.produtos
		return res.json(products.map(product => (
		{
			_id: product._id,
			imagem: formatImage(product.imagem),
			nome: product.nome,
			unidade: product.unidade,
			st: product.st,
			ipi: product.ipi,
			codigo: product.codigo,
			comissao: product.comissao,
			tabelas: product.tabelas
		})))
	},

	rawOne: async (req: Request, res: Response) =>
	{
		const {id: companyId, line: lineId, product: productId} = req.params

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'company not found!'})

		const line = company.linhas.find(linha => linha._id == lineId)
		if (!line)
			return res.status(404).json({message: 'line not found!'})

		const product = line.produtos.find(produto => produto._id == productId)
		if (!product)
			return res.status(404).json({message: 'product not found!'})

		return res.json(product)
	}
}

export default product