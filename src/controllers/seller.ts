import { Request, Response, NextFunction } from 'express'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcrypt'

import Seller from '../models/Seller'
import Company from '../models/Company'
import formatImage from '../utils/formatImage'

interface List
{
	id: string
	imagem: string
	nome: string
	funcao: string | undefined
}

export default
{
	create: async (req: Request, res: Response, next: NextFunction) =>
	{
		try {
			const image = req.file
			const {nome, telefones, email, senha, funcao, admin, representadas} = req.body

			const password = bcrypt.hashSync(senha, 10)
			if (!password)
				return res.status(500).json({message: 'Algo de errado aconteceu durante a encriptação da senha!'})
			
			await Seller.create(
			{
				nome,
				imagem: image && image.filename,
				telefones: JSON.parse(telefones),
				email,
				senha: password,
				funcao,
				admin,
				representadas: JSON.parse(representadas)
			})
			return res.status(201).send()
		} catch (error) {
			next(error)
		}
	},

	update: async (req: Request, res: Response, next: NextFunction) =>
	{
		try {
			const {id} = req.params
			const image = req.file
			const {nome, telefones, email, funcao, admin, representadas} = req.body

			interface Update
			{
				[letter: string]: any
			}
			let seller: Update = {}

			seller['_id'] = id
			if (nome) seller['nome'] = nome
			if (image)
			{
				seller['imagem'] = image.filename
				const previous = await Seller.findById(id)
				if (previous?.imagem)
					try {
						fs.unlinkSync(path.resolve(__dirname, '..', '..', 'uploads', previous.imagem))
					} catch (error) {
						if (error.code == 'ENOENT') console.log('file not found!')
					}
			}
			if (telefones) seller['telefones'] = JSON.parse(telefones)
			if (email) seller['email'] = email
			if (funcao) seller['funcao'] = funcao
			if (admin) seller['admin'] = admin
			if (representadas) seller['representadas'] = JSON.parse(representadas)

			const tmp = await Seller.findByIdAndUpdate(id, seller)
			res.status(200).send()
			return tmp
		} catch (error) {
			next(error)
		}
	},

	remove: async (req: Request, res: Response, next: NextFunction) =>
	{
			try {
				const {id} = req.params

				const company = await Company.findById(id)
				if (company?.imagem)
					fs.unlinkSync(path.resolve(__dirname, '..', '..', 'uploads', company.imagem))

				const tmp = await Seller.findByIdAndDelete(id)
				res.status(200).send()
				return tmp
			} catch (error) {
					next(error)
			}
	},

	list: async (req: Request, res: Response, next: NextFunction) =>
	{
			try {
					let list: List[] = []
					const sellers = await Seller.find()

					const promises = sellers.map(seller =>
					{
							list.push(
							{
									id: seller._id,
									imagem: formatImage(seller.imagem),
									nome: seller.nome,
									funcao: seller.funcao
							})
					})
					await Promise.all(promises)

					return res.json(list)
			} catch (error) {
					next(error)
			}
	},

	show: async (req: Request, res: Response, next: NextFunction) =>
	{
			try {
					const seller = await Seller.findById(req.params.id)
					if(seller !== null)
					{
							let companies: {id: string, nome_fantasia: string}[] = []
							const promises = seller.representadas.map(async company =>
							{
									const tmpCompany = await Company.findById(company.id)
									companies.push(
									{
											id: company.id,
											nome_fantasia: String(tmpCompany?.nome_fantasia)
									})
							})
							await Promise.all(promises)

							return res.json(
							{
									id: seller._id,
									imagem: formatImage(seller.imagem),
									nome: seller.nome,
									funcao: seller.funcao,
									telefones: seller.telefones,
									representadas: companies
							})
					}
			} catch (error) {
					next(error)
			}
	},

	raw: async (req: Request, res: Response, next: NextFunction) =>
	{
			try {
					const sellers = await Seller.find()

					return res.json(sellers.map(seller =>
					{
						let tmp = seller
						tmp.imagem = formatImage(tmp.imagem)
						return tmp
					}))
			} catch (error) {
					next(error)
			}
	},
	
	rawOne: async (req: Request, res: Response, next: NextFunction) =>
	{
		try {
			const {id} = req.params
			
			let seller = await Seller.findById(id)
			if (!seller)
				return res.status(404).json({message: 'seller not found!'})

			seller.imagem = formatImage(seller.imagem)

			return res.json(seller)
		} catch (error) {
			
		}
	}
}