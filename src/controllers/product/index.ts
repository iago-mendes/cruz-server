import {Request, Response} from 'express'
import fs from 'fs'
import path from 'path'

import Company from '../../models/Company'
import Client from '../../models/Client'
import formatImage from '../../utils/formatImage'

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
			comissao,
			peso,
			volume
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
				fs.unlinkSync(path.resolve('uploads', previous.imagem))
		}
		else if (previous.imagem)
			imagem = previous.imagem
		
		products[index] =
		{
			_id: previous._id,
			imagem,
			codigo: codigo ? codigo : previous.codigo,
			nome: nome ? nome : previous.nome,
			ipi: ipi ? ipi : previous.ipi,
			st: st ? st : previous.st,
			unidade: unidade ? unidade : previous.unidade,
			comissao: comissao ? comissao : previous.comissao,
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
			fs.unlinkSync(path.resolve('uploads', removed.imagem))
		
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
		const {company: companyId} = req.params
		const {client: clientId} = req.query

		let company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})

		const client = await Client.findById(clientId)
		if (!client)
			return res.json({message: 'Cliente não encontrado!'})

		const tableId = client.representadas.find(representada => String(representada.id) == String(company?._id))?.tabela
		if (!tableId)
			return res.json({message: 'Tabela não encontrada!'})

		let products:
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

		company.produtos.map(product =>
		{
			products.push(
			{
				id: product._id,
				imagem: formatImage(product.imagem),
				nome: product.nome,
				unidade: product.unidade,
				st: product.st,
				ipi: product.ipi,
				preco: product.tabelas.find(tabela => String(tabela.id) == String(tableId))?.preco,
			})
		})

		return res.json(products)
	},

	showPriced: async (req: Request, res: Response) =>
	{
		const {company: companyId, product: productId} = req.params
		const {client: clientId} = req.query

		const company = await Company.findById(companyId)
		if (!company)
			return res.json({message: 'Representada não encontrada!'})

		const product = company.produtos.find(produto => String(produto._id) == String(productId))
		if (!product)
			return res.json({message: 'Produto não encontrado!'})

		const client = await Client.findById(clientId)
		if (!client)
			return res.json({message: 'Cliente não encontrado!'})

		const clientCompany = client.representadas.find(representada => String(representada.id) == String(company._id))
		if (!clientCompany)
			return res.json({message: 'Representada não disponível para o cliente!'})

		const tableId = clientCompany.tabela
		const table = product.tabelas.find(tabela => String(tabela.id) == String(tableId))
		if (!table)
			return res.json({message: 'Tabela não encontrada!'})

		const show =
		{
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

	show: async (req: Request, res: Response) =>
	{
		const {company: companyId, product: productId} = req.params

		const company = await Company.findById(companyId)
		if (!company)
			return res.json({message: 'Representada não encontrada!'})

		const product = company.produtos.find(produto => String(produto._id) == String(productId))
		if (!product)
			return res.json({message: 'Produto não encontrado!'})

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
	},

	raw: async (req: Request, res: Response) =>
	{
		const {company: companyId} = req.params

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})

		let products = company.produtos.map(product => (
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
		}))

		return res.json(products)
	},

	rawOne: async (req: Request, res: Response) =>
	{
		const {company: companyId, product: productId} = req.params

		const company = await Company.findById(companyId)
		if (!company)
			return res.json({message: 'Representada não encontrada!'})

		const product = company.produtos.find(produto => String(produto._id) == String(productId))
		if (!product)
			return res.json({message: 'Produto não encontrado!'})

		return res.json(product)
	}
}

export default product