import {Request, Response} from 'express'
import fs from 'fs'
import path from 'path'

import Company from '../../models/Company'
import formatImage from '../../utils/formatImage'
import {getDate} from '../../utils/getDate'
import {handleObjectId} from '../../utils/handleObjectId'

const company = {
	create: async (req: Request, res: Response) => {
		const {
			_id,
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

		const company = {
			_id: handleObjectId(_id),
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
			tabelas: JSON.parse(tabelas),
			condicoes: JSON.parse(condicoes),
			produtos: [],
			modificadoEm: getDate()
		}

		await Company.create(company)
		return res.status(201).send()
	},

	update: async (req: Request, res: Response) => {
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

		const image = req.file

		interface Update {
			[letter: string]: any
		}
		const company: Update = {}

		const previous = await Company.findById(id)
		if (!previous) return res.json({message: 'company not found'})

		company['_id'] = id
		if (image) {
			company['imagem'] = image.filename
			if (previous && previous.imagem) {
				try {
					fs.unlinkSync(path.resolve('uploads', String(previous.imagem)))
				} catch (error) {
					console.error('[error while removing file]', error)
				}
			}
		}
		if (razao_social) company['razao_social'] = razao_social
		if (nome_fantasia) company['nome_fantasia'] = nome_fantasia
		if (cnpj) company['cnpj'] = cnpj
		if (telefones) company['telefones'] = JSON.parse(telefones)
		if (email) company['email'] = email
		if (comissao) company['comissao'] = JSON.parse(comissao)
		if (descricao_curta) company['descricao_curta'] = descricao_curta
		if (descricao) company['descricao'] = descricao
		if (site) company['site'] = site
		if (tabelas) company['tabelas'] = JSON.parse(tabelas)
		if (condicoes) company['condicoes'] = JSON.parse(condicoes)

		company['modificadoEm'] = getDate()

		const tmp = Company.findByIdAndUpdate(id, company)
		res.status(200).send()
		return tmp
	},

	remove: async (req: Request, res: Response) => {
		const {id} = req.params

		const company = await Company.findById(id)
		if (!company) return res.status(404).json({message: 'company not found!'})

		if (company.imagem) {
			try {
				fs.unlinkSync(path.resolve('uploads', company.imagem))
			} catch (error) {
				console.error('[error while removing file]', error)
			}
		}

		const tmp = Company.findByIdAndDelete(id)
		res.status(200).send()
		return tmp
	},

	list: async (req: Request, res: Response) => {
		const companies = await Company.find()

		const list = companies.map(company => ({
			id: company._id,
			imagem: formatImage(company.imagem),
			nome_fantasia: company.nome_fantasia,
			descricao_curta: String(company.descricao_curta)
		}))
		list.sort((a, b) => (a.nome_fantasia < b.nome_fantasia ? -1 : 1))

		return res.json(list)
	},

	show: async (req: Request, res: Response) => {
		const company = await Company.findById(req.params.id)

		if (!company) return res.status(404).json({message: 'company not found!'})

		return res.json({
			id: company._id,
			imagem: formatImage(company.imagem),
			nome_fantasia: company.nome_fantasia,
			descricao: company.descricao,
			site: company.site
		})
	},

	raw: async (req: Request, res: Response) => {
		const companies = await Company.find()

		const raw = companies.map(company => {
			const tmpCompany = company
			tmpCompany.imagem = formatImage(company.imagem)
			return tmpCompany
		})

		return res.json(raw)
	},

	rawOne: async (req: Request, res: Response) => {
		const {id} = req.params

		const company = await Company.findById(id)
		if (!company)
			return res.status(404).json({message: 'Empresa não encontrada!'})

		company.imagem = formatImage(company.imagem)

		return res.json(company)
	}
}

export default company
