import {Request, Response, NextFunction} from 'express'

import RequestModel from '../models/Request'
import Company from '../models/Company'
import Client from '../models/Client'
import Seller from '../models/Seller'

interface ListInterface
{
		id: string
		data: Date
		cliente: string
		vendedor: string
		representada: string
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

interface ShowInterface
{
		id: string
		data: Date
		condicao: string
		digitado_por?: string
		peso?: number
		tipo: {venda: boolean, troca: boolean}
		status: {concluido: boolean, enviado: boolean, faturado: boolean}
		cliente: {id: string, nome: string}
		vendedor: {id: string, nome: string}
		representada: {id: string, nome: string}
		linha: {id: string, nome: string}
		produtos: Array<Product>
		descontoTotal: number
		valorTotalProdutos: number
		valorTotal: number
}

const defaultList =
{
		id: '',
		data: new Date(),
		cliente: '',
		vendedor: '',
		representada: '',
		tipo: {venda: false, troca: false},
		status: {concluido: false, enviado: false, faturado: false}
}

export default class RequestController
{
	async create(req: Request, res: Response, next: NextFunction)
	{
			try {
					const request = req.body
					await RequestModel.create(request)
					return res.status(201).send()
			} catch (error) {
					next(error)
			}
	}

	async update(req: Request, res: Response, next: NextFunction)
	{
			try {
					const request = req.body
					const tmp = await RequestModel.findByIdAndUpdate(req.params.id, request, {new: true})
					res.status(200).send()
					return tmp
			} catch (error) {
					next(error)
			}
	}

	async remove(req: Request, res: Response, next: NextFunction)
	{
			try {
					const tmp = await RequestModel.findByIdAndDelete(req.params.id)
					res.status(200).send()
					return tmp
			} catch (error) {
					next(error)
			}
	}

	async list(req: Request, res: Response, next: NextFunction)
	{
			try {
					let list: ListInterface[] = []
					const requests = await RequestModel.find()

					const promises = requests.map(async request =>
					{
							const client = await Client.findById(request.cliente)
							const seller = await Seller.findById(request.vendedor)
							const company = await Company.findById(request.representada)
							const tmp =
							{
									id: request._id,
									data: request.data,
									cliente: String(client?.nome_fantasia),
									vendedor: String(seller?.nome),
									representada: String(company?.nome_fantasia),
									tipo: request.tipo,
									status: request.status
							}
							list.push(tmp)
					})
					await Promise.all(promises)

					return res.json(list)
			} catch (error) {
					next(error)
			}
	}

	async show(req: Request, res: Response, next: NextFunction)
	{
		try {
			const {id} = req.params

			const request = await RequestModel.findById(id)
			if (!request)
				return res.json({message: 'request not found'})

			const client = await Client.findById(request.cliente)
			if (!client)
				return res.json({message: 'client not found'})

			const seller = await Seller.findById(request.vendedor)
			if (!seller)
				return res.json({message: 'seller not found'})

			const company = await Company.findById(request.representada)
			if (!company)
				return res.json({message: 'company not found'})

			const line = company.linhas.find(linha => String(linha._id) == request.linha)
			if (!line)
				return res.json({message: 'line not found'})

			let totalValue = 0
			let totalProductsValue = 0
			let totalDiscount = 0

			let products: Product[] = []
			request.produtos.map(productSold =>
			{
				const product = line.produtos.find(product => product._id == productSold.id)
				if (!product)
					return res.status(404).json({message: 'product not found'})

				const clientCompany = client.representadas.find(tmpCompany => tmpCompany.id == company._id)
				if (!clientCompany)
					return res.json({message: 'client company not found'})

				const tableId = clientCompany.id

				const clientProduct = line.produtos.find(tmpProduct => tmpProduct._id == product._id)
				if (!clientProduct)
					return res.json({message: 'client product not found'})

				const table = clientProduct.tabelas.find(tmpTable => tmpTable.id == tableId)
				if (!table)
					return res.json({message: 'table not found'})
				
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
					imagem: String(product.imagem),
					quantidade: productSold.quantidade, 
					preco: productSold.preco, 
					precoTabela: tablePrice,
					ipi: product.ipi,
					st: product.st,
					subtotal: subtotal
				}
				products.push(tmp)
			})

			const show: ShowInterface =
			{
				id: request._id,
				data: request.data,
				condicao: request.condicao,
				digitado_por: request.digitado_por,
				peso: request.peso,
				tipo: request.tipo,
				status: request.status,
				cliente: {id: request.cliente, nome: client !== null ? client.nome_fantasia : ''},
				vendedor: {id: request.vendedor, nome: seller !== null ? seller.nome : ''},
				representada: {id: request.representada, nome: company !== null ? company.nome_fantasia : ''},
				linha: {id: request.linha, nome: line !== undefined ? line.nome : ''},
				produtos: products,
				descontoTotal: totalDiscount,
				valorTotalProdutos: totalProductsValue,
				valorTotal: totalValue
			}
			return res.json(show)
		} catch (error) {
			next(error)
		}
	}

	async all(req: Request, res: Response, next: NextFunction)
	{
			try {
					const requests = await RequestModel.find()
					return res.json(requests)
			} catch (error) {
					next(error)
			}
	}
}