import {Request, Response, NextFunction} from 'express'

import RequestModel, {RequestType} from '../models/Request'
import Company, {CompanyType, Line} from '../models/Company'
import Client, {ClientType} from '../models/Client'
import Seller from '../models/Seller'
import formatImage from '../utils/formatImage'

interface ListInterface
{
	id: string
	data: string
	cliente:
	{
		imagem: string
		nome_fantasia: string
		razao_social: string
	}
	vendedor:
	{
		imagem: string
		nome: string
	}
	representada:
	{
		imagem: string
		nome_fantasia: string
		razao_social: string
	}
	tipo: {venda: boolean, troca: boolean}
	status: {concluido: boolean, enviado: boolean, faturado: boolean}
}

interface Product
{
	id: string
	nome: string
	imagem: string
	quantidade: number
	preco: number
	precoTabela: number
	ipi: number
	st: number
	subtotal: number
}

function getPricedProducts(request: RequestType, company: CompanyType, client: ClientType, res: Response)
{
	let totalValue = 0
	let totalProductsValue = 0
	let totalDiscount = 0

	let products: Product[] = []
	request.produtos.map(productSold =>
	{
		const line = company.linhas.find(({_id}) => String(_id) == String(productSold.linhaId))
		if (!line)
			return res.status(404).json({message: 'line not found'})

		const product = line.produtos.find(product => String(product._id) == String(productSold.id))
		if (!product)
			return res.status(404).json({message: 'product not found'})

		const clientCompany = client.representadas.find(tmpCompany => String(tmpCompany.id) == String(company._id))
		if (!clientCompany)
			return res.status(404).json({message: 'client company not found'})

		const tableId = clientCompany.tabela

		const clientProduct = line.produtos.find(tmpProduct => String(tmpProduct._id) == String(product._id))
		if (!clientProduct)
			return res.status(404).json({message: 'client product not found'})

		const table = clientProduct.tabelas.find(tmpTable => String(tmpTable.id) == String(tableId))
		if (!table)
			return res.status(404).json({message: 'table not found'})
		
		const tablePrice = table.preco
		
		const subtotal = productSold.quantidade*productSold.preco
			+productSold.quantidade*productSold.preco*product.ipi/100
			+productSold.quantidade*productSold.preco*product.st/100

		totalProductsValue += productSold.quantidade*productSold.preco
		totalValue += subtotal
		totalDiscount += (tablePrice-productSold.preco)*productSold.quantidade

		const tmp =
		{
			id: String(product._id),
			nome: product.nome,
			imagem: formatImage(product.imagem),
			quantidade: productSold.quantidade, 
			preco: productSold.preco, 
			precoTabela: tablePrice,
			ipi: product.ipi,
			st: product.st,
			subtotal
		}
		products.push(tmp)
	})

	return {totalValue, totalProductsValue, totalDiscount, products}
}

export default
{
	async create(req: Request, res: Response, next: NextFunction)
	{
		try {
			const
			{
				data,
				condicao,
				digitado_por,
				cliente,
				vendedor,
				representada,
				peso,
				tipo,
				status,
				produtos
			} = req.body

			const request =
			{
				data,
				condicao,
				digitado_por,
				cliente,
				vendedor,
				representada,
				peso,
				tipo,
				status,
				produtos
			}

			await RequestModel.create(request)
			return res.status(201).send()
		} catch (error) {
			next(error)
		}
	},

	async update(req: Request, res: Response, next: NextFunction)
	{
		try {
			const {id} = req.params
			const
			{
				data,
				condicao,
				digitado_por,
				cliente,
				vendedor,
				representada,
				peso,
				tipo,
				status,
				produtos
			} = req.body

			const request =
			{
				data,
				condicao,
				digitado_por,
				cliente,
				vendedor,
				representada,
				peso,
				tipo,
				status,
				produtos
			}

			const tmp = await RequestModel.findByIdAndUpdate(id, request, {new: true})
			res.status(200).send()
			return tmp
		} catch (error) {
			next(error)
		}
	},

	async remove(req: Request, res: Response, next: NextFunction)
	{
		try {
			const {id} = req.params
			const tmp = await RequestModel.findByIdAndDelete(id)
			res.status(200).send()
			return tmp
		} catch (error) {
			next(error)
		}
	},

	async list(req: Request, res: Response, next: NextFunction)
	{
		try {
			let list: ListInterface[] = []
			const {client: clientId, page: requestedPage} = req.query

			const filter = clientId ? {cliente: String(clientId)} : {}
			const requestsAll = await RequestModel.find(filter)

			requestsAll.sort((a, b) => a.data < b.data ? 1 : -1)
			const postsPerPage = 10
			const totalPages = Math.ceil(requestsAll.length / postsPerPage)
			res.setHeader('totalPages', totalPages)

			let page = 1
			if (requestedPage)
				page = Number(requestedPage)

			if (!(page > 0 && page <= totalPages))
				return res.status(400).json({message: 'A página pedida é inválida!'})
			res.setHeader('page', page)

			const sliceStart = (page - 1) * postsPerPage
			const requests = requestsAll.slice(sliceStart, sliceStart + postsPerPage)

			const promises = requests.map(async request =>
			{
				const client = await Client.findById(request.cliente)
				if (!client)
					return res.status(404).json({message: 'client not found'})

				const seller = await Seller.findById(request.vendedor)
				if (request.vendedor && !seller)
					return res.status(404).json({message: 'seller not found'})

				const company = await Company.findById(request.representada)
				if (!company)
					return res.status(404).json({message: 'company not found'})

				const {totalValue} = getPricedProducts(request, company, client, res)

				const tmp =
				{
					id: request._id,
					data: request.data,
					cliente:
					{
						imagem: formatImage(client.imagem),
						nome_fantasia: client.nome_fantasia,
						razao_social: client.razao_social
					},
					vendedor:
					{
						imagem: formatImage(seller ? seller.imagem : undefined),
						nome: seller ? seller.nome : 'E-Commerce'
					},
					representada:
					{
						imagem: formatImage(company.imagem),
						nome_fantasia: company.nome_fantasia,
						razao_social: company.razao_social
					},
					tipo: request.tipo,
					status: request.status,
					valorTotal: totalValue
				}
				list.push(tmp)
			})
			await Promise.all(promises)

			return res.json(list)
		} catch (error) {
			next(error)
		}
	},

	async show(req: Request, res: Response, next: NextFunction)
	{
		try {
			const {id} = req.params

			const request = await RequestModel.findById(id)
			if (!request)
				return res.status(404).json({message: 'request not found'})

			const client = await Client.findById(request.cliente)
			if (!client)
				return res.status(404).json({message: 'client not found'})

			const seller = await Seller.findById(request.vendedor)
			if (seller && !seller)
				return res.status(404).json({message: 'seller not found'})

			const company = await Company.findById(request.representada)
			if (!company)
				return res.status(404).json({message: 'company not found'})

			const {products, totalValue, totalProductsValue, totalDiscount} = getPricedProducts(request, company, client, res)

			const show =
			{
				id: request._id,
				data: request.data,
				condicao: request.condicao,
				digitado_por: request.digitado_por,
				peso: request.peso,
				tipo: request.tipo,
				status: request.status,
				cliente:
				{
					id: request.cliente,
					nome_fantasia: client.nome_fantasia,
					razao_social: client.razao_social,
					imagem: formatImage(client.imagem),
					endereco: client.endereco
				},
				vendedor:
				{
					id: request.vendedor,
					nome: seller ? seller.nome : 'E-Commerce',
					imagem: formatImage(seller ? seller.imagem : undefined)
				},
				representada:
				{
					id: request.representada,
					razao_social: company.razao_social,
					nome_fantasia: company.nome_fantasia,
					imagem: formatImage(company.imagem)
				},
				produtos: products,
				descontoTotal: totalDiscount,
				valorTotalProdutos: totalProductsValue,
				valorTotal: totalValue
			}
			return res.json(show)
		} catch (error) {
			next(error)
		}
	},

	async raw(req: Request, res: Response, next: NextFunction)
	{
		try {
			const requests = await RequestModel.find()
			return res.json(requests)
		} catch (error) {
			next(error)
		}
	},

	async rawOne(req: Request, res: Response, next: NextFunction)
	{
		try {
			const {id} = req.params

			const request = await RequestModel.findById(id)
			if (!request)
				return res.status(404).json({message: 'request not found'})

			return res.json(request)
		} catch (error) {
			next(error)
		}
	}
}