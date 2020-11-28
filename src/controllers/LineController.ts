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
		if (!company) return res.status(404).json({message: 'company not found'})

		let lines = company.linhas
		lines.push({nome, imagem: image && image.filename, produtos: []})

		await Company.findByIdAndUpdate(id, {linhas: lines})
		return res.status(201).send()
	},

	async update(req: Request, res: Response, next: NextFunction)
	{
		try {
			const {id, line: lineId} = req.params
			const {nome} = req.body
			let image = req.file

			let company = await Company.findById(id)
			if (!company) return res.status(404).json({message: 'company not found'})
			const previous = company.linhas.find(linha => linha._id == lineId)
			if (!previous) return res.status(404).json({message: 'line not found'})

			
			let imagem: string | undefined
			if (image)
			{
				imagem = image.filename
				if (previous.imagem)
					fs.unlinkSync(path.join(__dirname, '..', '..', 'uploads', previous.imagem))
			}
			else if (previous.imagem)
				imagem = previous.imagem

			const lines = company.linhas.map(linha =>
			{
				if (linha._id != lineId) return linha
				else return {
					_id: linha._id,
					nome,
					imagem,
					produtos: linha.produtos
				}
			})

			const tmp = await Company.findByIdAndUpdate(id, {linhas: lines})
			res.status(200).send()
			return tmp
		} catch (error) {
			next(error)
		}
	},

	async remove(req: Request, res: Response, next: NextFunction)
	{
		const {id, line: lineId} = req.params

		const company = await Company.findById(req.params.id)
		if (!company) return res.status(404).json({message: 'company not found'})

		const previous = company.linhas.find(linha => linha._id == lineId)
		if (!previous) return res.status(404).json({message: 'line not found'})

		if (previous.imagem)
			fs.unlinkSync(path.join(__dirname, '..', '..', 'uploads', previous.imagem))

		let lines = company.linhas.filter(linha => linha._id != lineId)

		await Company.findByIdAndUpdate(id, {linhas: lines})
		return res.status(200).send()
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
	}
}