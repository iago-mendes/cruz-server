import {Request, Response, NextFunction} from 'express'
import fs from 'fs'
import path from 'path'

import Company from '../models/Company'
import Client from '../models/Client'
import formatImage from '../utils/formatImage'

export default
{
	async create(req: Request, res: Response, next: NextFunction)
	{
		const {id, line: lineId} = req.params
		const {nome, unidade, ipi, st, tabelas, codigo, comissao} = req.body
		let image = req.file

		let company = await Company.findById(id)
		if (!company) return res.status(404).json({message: 'company not found'})

		const line = company.linhas.find(linha => linha._id == lineId)
		if (!line) return res.status(404).json({message: 'line not found'})

		let products = line.produtos
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

		const lines = company.linhas.map(linha =>
		{
			if (linha._id != lineId) return linha
			else return {
				_id: linha._id,
				nome: linha.nome,
				imagem: linha.imagem,
				produtos: products
			}
		})

		const tmp = await Company.findByIdAndUpdate(id, {linhas: lines})
		res.status(200).send()
		return tmp
	},

	async update(req: Request, res: Response, next: NextFunction)
	{
		const {nome, unidade, ipi, st, tabelas, codigo, comissao} = req.body
		let image = req.file

		let previousCompany = await Company.findById(req.params.id)
		if (!previousCompany) return res.status(404).json({message: 'company not found'})
		const previousLine = previousCompany.linhas.find(linha => linha._id == req.params.line)
		if (!previousLine) return res.status(404).json({message: 'line not found'})
		const previous = previousLine.produtos.find(produto => produto._id == req.params.product)
		if (!previous) return res.status(404).json({message: 'product not found'})

		let imagem: string | undefined
		if (image)
		{
			imagem = image.filename
			if (previous.imagem)
				fs.unlinkSync(path.join(__dirname, '..', '..', 'uploads', previous.imagem))
		}
		else if (previous.imagem)
			imagem = previous.imagem

		const lines = previousCompany.linhas.map(linha =>
		{
			if (linha._id != req.params.line) return linha
			else return {
				_id: linha._id,
				nome: linha.nome,
				imagem: linha.imagem,
				produtos: linha.produtos.map(produto =>
				{
					if (produto._id != req.params.product) return produto
					else return {
						_id: produto._id,
						imagem,
						codigo,
						nome,
						ipi,
						st,
						unidade,
						comissao,
						tabelas: JSON.parse(tabelas)
					}
				})
			}
		})

		const tmp = await Company.findByIdAndUpdate(req.params.id, {linhas: lines})
		res.status(200).send()
		return tmp
	},

	async remove(req: Request, res: Response, next: NextFunction)
	{
		const {id, line: lineId, product: productId} = req.params

		const company = await Company.findById(req.params.id)
		if (!company) return res.status(404).json({message: 'company not found'})

		const line = company.linhas.find(linha => linha._id == lineId)
		if (!line) return res.status(404).json({message: 'line not found'})

		const product = line.produtos.find(produto => produto._id == productId)
		if (!product) return res.status(404).json({message: 'product not found'})

		if (product.imagem)
			fs.unlinkSync(path.join(__dirname, '..', '..', 'uploads', product.imagem))

		const lines = company.linhas.map(linha => (
		{
			_id: linha._id,
			nome: linha.nome,
			imagem: linha.imagem,
			produtos: linha.produtos.filter(produto => produto._id != productId)
		}))

		await Company.findByIdAndUpdate(id, {linhas: lines})
		return res.status(200).send()
	},

	async list(req: Request, res: Response, next: NextFunction)
	{
			try {
					const company = await Company.findById(req.params.id)
					const line = company?.linhas.find(linha => linha._id == req.params.line)
					if (!line) return res.json({message: 'line not found'})

					const list = line.produtos.map(produto => (
					{
							id: produto._id,
							imagem: formatImage(produto.imagem),
							nome: produto.nome,
							unidade: produto.unidade
					}))
					await Promise.all(list)

					return res.json(list)
			} catch (error) {
					next(error)
			}
	},

	async listPriced(req: Request, res: Response, next: NextFunction)
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

	async showPriced(req: Request, res: Response, next: NextFunction)
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

	async show(req: Request, res: Response, next: NextFunction)
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

	async raw(req: Request, res: Response, next: NextFunction)
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

	async rawOne(req: Request, res: Response, next: NextFunction)
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