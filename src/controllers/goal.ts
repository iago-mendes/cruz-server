import {Request, Response} from 'express'
import {differenceInBusinessDays, lastDayOfMonth} from 'date-fns'

import Goal from '../models/Goal'
import Company from '../models/Company'
import Seller from '../models/Seller'
import {getDate} from '../utils/getDate'
import RequestModel from '../models/Request'
import getTotalValue from '../utils/requests/getTotalValue'

export const goalController = {
	create: async (req: Request, res: Response) => {
		const {month, companies} = req.body

		const existingGoal = await Goal.findOne({month})
		if (existingGoal)
			return res
				.status(400)
				.json({message: 'Já existe uma meta para o mês enviado!'})

		const goal = {
			month,
			companies,
			modifiedAt: getDate()
		}

		const createdGoal = await Goal.create(goal)
		return res.status(201).json(createdGoal)
	},

	update: async (req: Request, res: Response) => {
		const {month} = req.params
		const {companies} = req.body

		const previousGoal = await Goal.findOne({month})
		if (!previousGoal)
			return res.status(404).json({message: 'Meta não encontrada!'})

		const goal = {
			month,
			companies: companies ? companies : previousGoal.companies,
			modifiedAt: getDate()
		}

		const updatedGoal = await Goal.findOneAndUpdate({month}, goal)
		return res.json(updatedGoal)
	},

	remove: async (req: Request, res: Response) => {
		const {month} = req.params

		const previousGoal = await Goal.findOne({month})
		if (!previousGoal)
			return res.status(404).json({message: 'Meta não encontrada!'})

		const removedGoal = await Goal.findOneAndDelete({month})
		return res.json(removedGoal)
	},

	show: async (req: Request, res: Response) => {
		const {month} = req.params

		const goal = await Goal.findOne({month})
		if (!goal) return res.status(404).json({message: 'Meta não encontrada!'})

		let totalGoal = 0
		let totalSold = 0

		type Sellers = Array<{
			id: string
			name: string
			goal: number
			sold: number
		}>
		type Companies = Array<{
			id: string
			name: string
			goal: number
			sold: number
			sellers: Sellers
			eCommerceGoal: number
			eCommerceSold: number
		}>

		const companies: Companies = []
		const sellers: Sellers = []
		const days: Array<{
			day: string
			sold: number
		}> = []

		await Promise.all(
			goal.companies.map(async company => {
				const rawCompany = await Company.findById(company.id)
				const companyName = rawCompany
					? rawCompany.nome_fantasia
					: 'Representada não encontrada'

				let companyGoal = 0
				let companySold = 0
				const companySellers: Sellers = []

				await Promise.all(
					company.sellers.map(async seller => {
						const rawSeller = await Seller.findById(seller.id)
						const sellerName = rawSeller
							? rawSeller.nome
							: 'Vendedor não encontrado'

						const requests = await RequestModel.find({
							representada: company.id,
							vendedor: seller.id
						})
						const monthRequests = requests.filter(({data}) =>
							data.includes(month)
						)

						let sellerSold = 0
						monthRequests.forEach(rawRequest => {
							const totalValue = getTotalValue(rawRequest, rawCompany)

							sellerSold += totalValue

							const existingDayIndex = days.findIndex(({day}) =>
								rawRequest.data.includes(day)
							)
							if (existingDayIndex < 0)
								days.push({
									day: rawRequest.data,
									sold: totalValue
								})
							else days[existingDayIndex].sold += totalValue
						})

						companyGoal += seller.goal
						companySold += sellerSold

						const existingIndex = sellers.findIndex(
							({id}) => String(id) == String(seller.id)
						)
						if (existingIndex > 0) {
							sellers[existingIndex].goal += seller.goal
							sellers[existingIndex].sold += sellerSold
						} else
							sellers.push({
								id: seller.id,
								name: sellerName,
								goal: seller.goal,
								sold: sellerSold
							})

						companySellers.push({
							id: seller.id,
							name: sellerName,
							goal: seller.goal,
							sold: sellerSold
						})
					})
				)

				companySellers.sort((a, b) => (a.sold > b.sold ? -1 : 1))

				const eCommerceRequests = await RequestModel.find({
					representada: company.id,
					vendedor: undefined
				})
				const monthECommerceRequests = eCommerceRequests.filter(({data}) =>
					data.includes(month)
				)

				let eCommerceSold = 0
				monthECommerceRequests.forEach(rawRequest => {
					const totalValue = getTotalValue(rawRequest, rawCompany)
					eCommerceSold += totalValue

					const existingDayIndex = days.findIndex(({day}) =>
						rawRequest.data.includes(day)
					)
					if (existingDayIndex < 0)
						days.push({
							day: rawRequest.data,
							sold: totalValue
						})
					else days[existingDayIndex].sold += totalValue
				})

				companyGoal += company.eCommerceGoal
				companySold += eCommerceSold

				totalGoal += companyGoal
				totalSold += companySold

				companies.push({
					id: company.id,
					name: companyName,
					goal: companyGoal,
					sold: companySold,
					sellers: companySellers,
					eCommerceGoal: company.eCommerceGoal,
					eCommerceSold
				})
			})
		)

		sellers.sort((a, b) => (a.sold > b.sold ? -1 : 1))
		days.sort((a, b) => (a.day < b.day ? -1 : 1))

		const today = new Date(Date.now())
		const monthMiddleDate = new Date(`${month}-15`)
		const lastMonthDay = lastDayOfMonth(monthMiddleDate)
		const remainingBusinessDays = differenceInBusinessDays(lastMonthDay, today)

		const showResponse = {
			month,
			companies,
			sellers,
			goal: totalGoal,
			sold: totalSold,
			days,
			remainingBusinessDays
		}

		return res.json(showResponse)
	},

	raw: async (req: Request, res: Response) => {
		const goals = await Goal.find()

		return res.json(goals)
	},

	rawOne: async (req: Request, res: Response) => {
		const {month} = req.params

		const goal = await Goal.findOne({month})
		if (!goal) return res.status(404).json({message: 'Meta não encontrada!'})

		return res.json(goal)
	}
}
