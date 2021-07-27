import {Request, Response} from 'express'
import fs from 'fs'
import path from 'path'

import Company from '../../models/Company'
import compareIds from '../../utils/compareIds'
import {getDate} from '../../utils/getDate'

const companyUtils = {
	updateTables: async (req: Request, res: Response) => {
		const {company: companyId} = req.params
		const {
			targetTable,
			relatedTables
		}: {
			targetTable: {
				id: string
				change: number // 1 => no change
			}
			relatedTables: Array<{
				id: string
				relation: number // 1 => equal
			}>
		} = req.body

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})

		const products = company.produtos.map(product => {
			const target = product.tabelas.find(({id}) =>
				compareIds(id, targetTable.id)
			)
			if (!target) return product

			const newTargetPrice = target.preco * targetTable.change

			const tmpProduct = product
			tmpProduct.tabelas = product.tabelas.map(table => {
				const tmpTable = table

				const relatedTable = relatedTables.find(({id}) =>
					compareIds(id, table.id)
				)

				if (compareIds(table.id, targetTable.id))
					tmpTable.preco = newTargetPrice
				else if (relatedTable)
					tmpTable.preco = newTargetPrice * relatedTable.relation

				return tmpTable
			})

			return tmpProduct
		})

		const savedRelatedTables = relatedTables.map(table => ({
			id: table.id,
			target: targetTable.id,
			relation: table.relation
		}))

		const updatedCompany = await Company.findByIdAndUpdate(
			company._id,
			{
				produtos: products,
				relatedTables: savedRelatedTables,
				modificadoEm: getDate()
			},
			{new: true}
		)
		return res.json(updatedCompany)
	},

	getTables: async (req: Request, res: Response) => {
		const {company: companyId} = req.params

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})

		const tables = company.tabelas.map(table => ({
			id: String(table._id),
			nome: table.nome
		}))

		return res.json(tables)
	},

	updateProductsImage: async (req: Request, res: Response) => {
		const {company: companyId} = req.params
		const {relations: sentRelations} = req.body

		const images = req.files as Express.Multer.File[]
		if (!images)
			return res.status(400).json({message: 'Nenhuma imagem foi enviada!'})

		const relations: Array<{imageFilename: string; productId: string}> =
			typeof sentRelations === 'string'
				? JSON.parse(String(sentRelations))
				: sentRelations

		const company = await Company.findById(companyId)
		if (!company)
			return res.status(404).json({message: 'Representada não encontrada!'})

		const products = company.produtos
		await Promise.all(
			images.map(async image => {
				const relation = relations.find(
					({imageFilename}) => imageFilename === image.originalname
				)
				if (!relation) return

				const productIndex = products.findIndex(({_id}) =>
					compareIds(_id, relation.productId)
				)
				if (productIndex < 0) return

				const previousImage = products[productIndex].imagem
				if (previousImage)
					try {
						fs.unlinkSync(path.resolve('uploads', previousImage))
					} catch (error) {
						console.log('<< error while removing image >>', error)
					}

				products[productIndex].imagem = image.filename
			})
		)

		await Company.findByIdAndUpdate(company._id, {produtos: products})

		return res.send()
	}
}

export default companyUtils
