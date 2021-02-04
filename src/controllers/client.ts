import {Request, Response, NextFunction} from 'express'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcrypt'

import Client from '../models/Client'
import Company from '../models/Company'
import Seller from '../models/Seller'
import formatImage from '../utils/formatImage'

interface List
{
	id: string
	imagem: string
	nome_fantasia: string
	razao_social: string
	status: {ativo: boolean, aberto: boolean, nome_sujo: boolean}
}

export default
{
	async create(req: Request, res: Response, next: NextFunction)
	{
		try {
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
				representadas
			} = req.body
			const image = req.file

			let password = bcrypt.hashSync(senha, 10)
			if (!password)
				return res.status(500).json({message: 'error while encrypting password!'})

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
				representadas: JSON.parse(representadas)
			}

			await Client.create(client)
			return res.status(201).send()
		} catch (error) {
			next(error)
		}
	},

	async update(req: Request, res: Response, next: NextFunction)
	{
		try {
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
				razao_social,
				nome_fantasia,
				cnpj,
				insc_estadual,
				telefone,
				email,
				vendedores: JSON.parse(vendedores),
				endereco: JSON.parse(endereco),
				status: JSON.parse(status),
				condicoes: JSON.parse(condicoes),
				representadas: JSON.parse(representadas)
			}

			const tmp = await Client.findByIdAndUpdate(id, client)
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
		} catch (error) {
			next(error)
		}
	},

	async list(req: Request, res: Response, next: NextFunction)
	{
		try {
			const clients = await Client.find()
			
			let list: List[] = []
			clients.map(client =>
			{
				list.push(
				{
					id: client.id,
					imagem: formatImage(client.imagem),
					nome_fantasia: client.nome_fantasia,
					razao_social: client.razao_social,
					status: client.status
				})
			})

			return res.json(list)
		} catch (error) {
			next(error)
		}
	},

	async show(req: Request, res: Response, next: NextFunction)
	{
		try {
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
		} catch (error) {
			next(error)
		}
	},

	async raw(req: Request, res: Response, next: NextFunction)
	{
		try {
			const clients = await Client.find()
			const list = clients.map(client =>
			{
				let tmp = client
				tmp.imagem = formatImage(tmp.imagem)
				return tmp
			})

			return res.json(list)
		} catch (error) {
			next(error)
		}
	},

	async rawOne(req: Request, res: Response, next: NextFunction)
	{
		try {
			const {id} = req.params
			
			let client = await Client.findById(id)
			if (!client)
				return res.status(404).json({message: 'client not found!'})

			client.imagem = formatImage(client.imagem)

			return res.json(client)
		} catch (error) {
			next(error)
		}
	},

	async getConditions(req: Request, res: Response, next: NextFunction)
	{
		const {client: clientId, company: companyId} = req.params
		
		const client = await Client.findById(clientId)
		if (!client)
			return res.status(404).json({message: 'Cliente não encontrado!'})

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})

		const conditions =
		{
			vista: client.condicoes.vista,
			cheque: client.condicoes.cheque,
			prazo: client.condicoes.prazo,
			prazoOpcoes: company.condicoes
		}

		return res.json(conditions)
	}
}