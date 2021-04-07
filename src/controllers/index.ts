import {Request, Response} from 'express'
import path from 'path'

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