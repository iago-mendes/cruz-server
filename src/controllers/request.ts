import {Request, Response, NextFunction, request} from 'express'

import RequestModel from '../models/Request'
import Company from '../models/Company'
import Client from '../models/Client'
import Seller from '../models/Seller'
import formatImage from '../utils/formatImage'
import getPricedProducts from '../utils/requests/getPricedProducts'
import getRequest from '../utils/requests/getRequest'

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
			const totalPages = requestsAll.length !== 0
				? Math.ceil(requestsAll.length / postsPerPage)
				: 1
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

				const {totalValue} = getPricedProducts(request, company, client)

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
		const {id} = req.params

		const {request, error} = await getRequest(id)
		if (!request)
			return res.status(404).json({message: error})

		return res.json(request)
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