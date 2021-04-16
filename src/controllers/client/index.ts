import {Request, Response} from 'express'
import fs from 'fs'
import path from 'path'

import Client from '../../models/Client'
import Company from '../../models/Company'
import Seller from '../../models/Seller'
import formatImage from '../../utils/formatImage'
import encryptPwd from '../../utils/encryptPwd'

interface List
{
	id: string
	imagem: string
	nome_fantasia: string
	razao_social: string
	status: {ativo: boolean, aberto: boolean, nome_sujo: boolean}
}

const client =
{
	create: async (req: Request, res: Response) =>
	{
		const {
			razao_social,
			nome_fantasia,
			cnpj,
			insc_estadual,
			telefone,
			email,
			senha,
			vendedores,
			endereco,
			status,
			condicoes,
			contatos,
			representadas
		} = req.body
		const image = req.file

		const password = encryptPwd(senha)
		if (!password)
			return res.status(500).json({message: 'Algo de errado aconteceu durante a encriptação da senha!'})

		const client =
		{
			imagem: image && image.filename,
			razao_social,
			nome_fantasia,
			cnpj,
			insc_estadual,
			telefone,
			email,
			senha: password,
			vendedores: JSON.parse(vendedores),
			endereco: JSON.parse(endereco),
			status: JSON.parse(status),
			condicoes: JSON.parse(condicoes),
			contatos: JSON.parse(contatos),
			representadas: JSON.parse(representadas)
		}

		await Client.create(client)
		return res.status(201).send()
	},

	update: async (req: Request, res: Response) =>
	{
		const {id} = req.params
		const {
			razao_social,
			nome_fantasia,
			cnpj,
			insc_estadual,
			telefone,
			email,
			vendedores,
			endereco,
			status,
			condicoes,
			contatos,
			representadas
		} = req.body
		const image = req.file

		const previous = await Client.findById(id)
		if (!previous)
			return res.json({message: 'client not found'})

		let imagem: string | undefined
		if (image)
		{
			imagem = image.filename
			if (previous.imagem)
				try {
					fs.unlinkSync(path.resolve(__dirname, '..', '..', 'uploads', previous.imagem))
				} catch (error) {
					if (error.code == 'ENOENT')
						console.log('file not found!')
				}
		}
		else if (previous.imagem)
			imagem = previous.imagem

		const client =
		{
			imagem,
			razao_social: razao_social || previous.razao_social,
			nome_fantasia: nome_fantasia || previous.nome_fantasia,
			cnpj: cnpj || previous.cnpj,
			insc_estadual: insc_estadual || previous.insc_estadual,
			telefone: telefone || previous.telefone,
			email: email || previous.email,
			vendedores: vendedores ? JSON.parse(vendedores) : previous.vendedores,
			endereco: endereco ? JSON.parse(endereco) : previous.endereco,
			status: status ? JSON.parse(status) : previous.status,
			condicoes: condicoes ? JSON.parse(condicoes) : previous.condicoes,
			contatos: contatos ? JSON.parse(contatos) : previous.contatos,
			representadas: representadas ? JSON.parse(representadas) : previous.representadas
		}

		const tmp = await Client.findByIdAndUpdate(id, client)
		res.status(200).send()
		return tmp
	},

	remove: async (req: Request, res: Response) =>
	{
		const {id} = req.params
		
		const client = await Client.findById(id)
		if (!client)
			return res.json({message: 'client not found'})

		if (client.imagem)
			try {
				fs.unlinkSync(path.resolve(__dirname, '..', '..', 'uploads', client.imagem))
			} catch (error) {
				if (error.code == 'ENOENT')
					console.log('file not found!')
			}
		
		const tmp = await Client.findByIdAndDelete(id)
		res.status(200).send()
		return tmp
	},

	list: async (req: Request, res: Response) =>
	{
		const {search: searchString, page: requestedPage} = req.query

		const filter = searchString ? {$text: {$search: String(searchString)}} : {}
		const rawClients = await Client.find(filter)

		const clientsPerPage = 15
		const totalPages = rawClients.length > 0
			? Math.ceil(rawClients.length / clientsPerPage)
			: 1
		res.setHeader('total-pages', totalPages)

		let page = requestedPage ? Number(requestedPage) : 1
		if (!(page > 0 && page <= totalPages) || Number.isNaN(page))
			return res.status(400).json({message: 'Página requisitada é inválida!'})
		res.setHeader('page', page)

		const sliceStart = (page - 1) * clientsPerPage
		const clients = rawClients
			.slice(sliceStart, sliceStart + clientsPerPage)
			.map(client => (
			{
				id: client._id,
				imagem: formatImage(client.imagem),
				nome_fantasia: client.nome_fantasia,
				razao_social: client.razao_social,
				status: client.status
			}))
		
		return res.json(clients)
	},

	show: async (req: Request, res: Response) =>
	{
		const {id} = req.params

		const client = await Client.findById(id)
		if (!client)
			return res.status(404).json({message: 'client not found'})

		let sellers: {id: string, nome: string}[] = []
		const promises1 = client.vendedores.map(async sellerId =>
		{
			const tmpSeller = await Seller.findById(sellerId)
			sellers.push(
			{
				id: sellerId,
				nome: tmpSeller ? tmpSeller.nome : 'not found'
			})
		})
		await Promise.all(promises1)

		let companies:
		{
			id: string
			nome_fantasia: string
			tabela: string
		}[] = []
		const promises2 = client.representadas.map(async company =>
		{
			const tmpCompany = await Company.findById(company.id)
			companies.push(
			{
				id: company.id,
				nome_fantasia: tmpCompany ? tmpCompany.nome_fantasia : 'not found',
				tabela: company.tabela
			})
		})
		await Promise.all(promises2)

		return res.json(
		{
			id: client.id,
			imagem: formatImage(client.imagem),
			razao_social: client.razao_social,
			nome_fantasia: client.nome_fantasia,
			cnpj: client.cnpj,
			insc_estadual: client.insc_estadual,
			telefone: client.telefone,
			email: client.email,
			endereco: client.endereco,
			status: client.status,
			vendedores: sellers,
			representadas: companies
		})
	},

	raw: async (req: Request, res: Response) =>
	{
		const clients = await Client.find()
		const list = clients.map(client =>
		{
			let tmp = client
			tmp.imagem = formatImage(tmp.imagem)
			return tmp
		})

		return res.json(list)
	},

	rawOne: async (req: Request, res: Response) =>
	{
		const {id} = req.params
		
		let client = await Client.findById(id)
		if (!client)
			return res.status(404).json({message: 'client not found!'})

		client.imagem = formatImage(client.imagem)

		return res.json(client)
	}
}

export default client