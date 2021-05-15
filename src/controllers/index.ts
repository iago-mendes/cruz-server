import {Request, Response} from 'express'
import path from 'path'

import Client from '../models/Client'
import Company from '../models/Company'
import RequestModel from '../models/Request'
import Seller from '../models/Seller'
import formatImage from '../utils/formatImage'

const banners: Array<
{
	filename: string
	alt: string
}> = require(path.resolve('db', 'banners.json'))

export const getBanners = async (req: Request, res: Response) =>
{
	const urls = banners.map(banner =>
	{
		const url = formatImage(banner.filename, 'public/banners')
		return url
	})

	return res.json(urls)
}

export const sync = async (req: Request, res: Response) =>
{
	const implementationDate = '2021-05-15'

	const clients = (await Client.find()).map(client => (
		{
			id: String(client._id),
			modifiedAt: client.modificadoEm ? client.modificadoEm : implementationDate
		}))
	
	const companies = (await Company.find()).map(company => (
		{
			id: String(company._id),
			modifiedAt: company.modificadoEm ? company.modificadoEm : implementationDate
		}))
	
	const requests = (await RequestModel.find()).map(request => (
		{
			id: String(request._id),
			modifiedAt: request.modificadoEm ? request.modificadoEm : implementationDate
		}))
	
	const sellers = (await Seller.find()).map(seller => (
		{
			id: String(seller._id),
			modifiedAt: seller.modificadoEm ? seller.modificadoEm : implementationDate
		}))

	const syncIds =
	{
		clients,
		companies,
		requests,
		sellers
	}

	return res.json(syncIds)
}