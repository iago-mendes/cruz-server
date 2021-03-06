import {Request, Response, NextFunction} from 'express'
import fs from 'fs'
import path from 'path'

import Company from '../models/Company'
import formatImage from '../utils/formatImage'

interface ListInterface
{
	id: string
	imagem: string
	nome_fantasia: string
	descricao_curta: string
}

export default
{
	async create(req: Request, res: Response, next: NextFunction)
	{
		const {
			razao_social, 
			nome_fantasia,
			cnpj,
			telefones,
			email,
			comissao,
			descricao_curta,
			descricao,
			site,
			tabelas,
			condicoes
		} = req.body
		
		const image = req.file
		
		Company.create(
		{
			imagem: image && image.filename,
			razao_social,
			nome_fantasia,
			cnpj,
			telefones: JSON.parse(telefones),
			email,
			comissao: JSON.parse(comissao),
			descricao_curta,
			descricao,
			site,
			tabelas,
			condicoes,
			linhas: []
		})
		return res.status(201).send()
	},
		
	async update(req: Request, res: Response, next: NextFunction)
	{
		try {
			const id = req.params.id
			const {
				razao_social, 
				nome_fantasia,
				cnpj,
				telefones,
				email,
				comissao,
				descricao_curta,
				descricao,
				site,
				tabelas,
				condicoes
			} = req.body
			
			let image = req.file
			
			interface Update
			{
				[letter: string]: any
			}
			let company: Update = {}

			const previous = await Company.findById(id)
			if (!previous)
				return res.json({message: 'company not found'})
			
			company['_id'] = id
			if(image)
			{
				company['imagem'] = image.filename
				if (previous?.imagem)
					fs.unlinkSync(path.resolve(__dirname, '..', '..', 'uploads', previous.imagem))
			}
			if(razao_social)
				company['razao_social'] = razao_social
			if(nome_fantasia)
				company['nome_fantasia'] = nome_fantasia
			if(cnpj)
				company['cnpj'] = cnpj
			if(telefones)
				company['telefones'] = JSON.parse(telefones)
			if(email)
				company['email'] = email
			if(comissao)
				company['comissao'] = JSON.parse(comissao)
			if(descricao_curta)
				company['descricao_curta'] = descricao_curta
			if(descricao)
				company['descricao'] = descricao
			if(site)
				company['site'] = site
			if(tabelas)
				company['tabelas'] = JSON.parse(tabelas)
			if(condicoes)
				company['condicoes'] = JSON.parse(condicoes)
			
			const tmp = Company.findByIdAndUpdate(id, company)
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
			
			const company = await Company.findById(id)
			if (!company)
			return res.status(404).json({message: 'company not found!'})
			
			if(company.imagem)
			fs.unlinkSync(path.resolve(__dirname, '..', '..', 'uploads', company.imagem))
			
			const tmp = Company.findByIdAndDelete(id)
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
			const companies = await Company.find()
			
			const promises = companies.map(company =>
				{
					list.push(
						{
							id: company._id,
							imagem: formatImage(company.imagem),
							nome_fantasia: company.nome_fantasia,
							descricao_curta: String(company.descricao_curta)
						})
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
			const company = await Company.findById(req.params.id)
			
			if (!company)
			return res.status(404).json({message: 'company not found!'})
			
			return res.json(
				{
					id: company._id,
					imagem: formatImage(company.imagem),
					nome_fantasia: company.nome_fantasia,
					descricao: company.descricao,
					site: company.site
				})
			} catch (error) {
				next(error)
			}
	},
					
	async raw(req: Request, res: Response, next: NextFunction)
	{
		try {
			const companies = await Company.find()

			const raw = companies.map(company =>
			{
				let tmpCompany = company
				tmpCompany.imagem = formatImage(company.imagem)
				return tmpCompany
			})

			return res.json(raw)
		} catch (error) {
			next(error)
		}
	},
					
	async rawOne(req: Request, res: Response, next: NextFunction)
	{
		try {
			const {id} = req.params

			let company = await Company.findById(id)
			if (!company)
				return res.status(404).json({message: 'Empresa não encontrada!'})

			company.imagem = formatImage(company.imagem)

			return res.json(company)
		} catch (error) {
			next(error)
		}
	}
}