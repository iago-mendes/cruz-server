import {Request, Response} from 'express'
import path from 'path'

import Client from '../models/Client'
import Company from '../models/Company'
import Goal from '../models/Goal'
import RequestModel from '../models/Request'
import Seller from '../models/Seller'
import formatImage from '../utils/formatImage'

const banners: Array<{
	filename: string
	alt: string
}> = require(path.resolve('db', 'banners.json'))

export const getBanners = async (req: Request, res: Response) => {
	const urls = banners.map(banner => {
		const url = formatImage(banner.filename, 'public/banners')
		return url
	})

	return res.json(urls)
}

export const sync = async (req: Request, res: Response) => {
	const implementationDate = '2021-05-15'
	let lastModifiedAt = implementationDate

	const clients = (await Client.find()).map(client => {
		const modifiedAt = client.modificadoEm
			? client.modificadoEm
			: implementationDate
		if (modifiedAt > lastModifiedAt) lastModifiedAt = modifiedAt

		return {
			id: String(client._id),
			modifiedAt
		}
	})

	const companies = (await Company.find()).map(company => {
		const modifiedAt = company.modificadoEm
			? company.modificadoEm
			: implementationDate
		if (modifiedAt > lastModifiedAt) lastModifiedAt = modifiedAt

		return {
			id: String(company._id),
			modifiedAt
		}
	})

	const requests = (await RequestModel.find()).map(request => {
		const modifiedAt = request.modificadoEm
			? request.modificadoEm
			: implementationDate
		if (modifiedAt > lastModifiedAt) lastModifiedAt = modifiedAt

		return {
			id: String(request._id),
			modifiedAt
		}
	})

	const sellers = (await Seller.find()).map(seller => {
		const modifiedAt = seller.modificadoEm
			? seller.modificadoEm
			: implementationDate
		if (modifiedAt > lastModifiedAt) lastModifiedAt = modifiedAt

		return {
			id: String(seller._id),
			modifiedAt
		}
	})

	const goals = (await Goal.find()).map(goal => {
		const modifiedAt = goal.modifiedAt ? goal.modifiedAt : implementationDate
		if (modifiedAt > lastModifiedAt) lastModifiedAt = modifiedAt

		return {
			month: String(goal.month),
			modifiedAt
		}
	})

	const syncIds = {
		lastModifiedAt,
		clients,
		companies,
		requests,
		sellers,
		goals
	}

	return res.json(syncIds)
}
