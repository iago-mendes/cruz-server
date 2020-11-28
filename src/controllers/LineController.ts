import {Request, Response, NextFunction} from 'express'
import fs from 'fs'
import path from 'path'

import Company from '../models/Company'
import baseUrl from '../config/baseUrl'

export default
{
	async create(req: Request, res: Response, next: NextFunction)
	{
		const {id} = req.params
		const {nome} = req.body
		const image = req.file

		const company = await Company.findById(req.params.id)
		if (!company) return res.json({message: 'company not found'})

		let lines = company.linhas
		lines.push({nome, imagem: image && image.filename, produtos: []})

		await Company.findByIdAndUpdate(id, {linhas: lines})
		return res.status(201).send()
	},

	async list(req: Request, res: Response, next: NextFunction)
	{
		try {
			const company = await Company.findById(req.params.id)
			if (!company) return res.json({message: 'company not found'})

			const list = company.linhas.map(linha => (
			{
				id: linha._id,
				nome: linha.nome,
				imagem: linha.imagem
					? `${baseUrl}/uploads/${linha.imagem}`
					: `${baseUrl}/uploads/assets/no-image.png`
			}))
			await Promise.all(list)

			return res.json(list)
		} catch (error) {
			next(error)
		}
	},

	async update(req: Request, res: Response, next: NextFunction)
	{
		try {
			const {nome} = req.body
			let image = req.file

			let company = await Company.findById(req.params.id)
			if (!company) return res.json({message: 'company not found'})
			const previous = company.linhas.find(linha => linha._id == req.params.line)
			if (!previous) return res.json({message: 'line not found'})

			if (image.originalname === previous.imagem)
			{
				fs.unlinkSync(path.join(__dirname, '..', '..', 'uploads', image.filename))
				image.filename = previous.imagem
			}
			else if (previous.imagem) fs.unlinkSync(path.join(__dirname, '..', '..', 'uploads', previous.imagem))

			const lines = company.linhas.map(linha =>
			{
				if (linha._id != req.params.line) return linha
				else return {
					_id: linha._id,
					nome,
					imagem: image.filename,
					produtos: linha.produtos
				}
			})

			const tmp = await Company.findByIdAndUpdate(req.params.id, {linhas: lines})
			res.status(200).send()
			return tmp
		} catch (error) {
			next(error)
		}
	}
}