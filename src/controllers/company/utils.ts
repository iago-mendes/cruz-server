import {Request, Response} from 'express'

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
	}
}

export default companyUtils
