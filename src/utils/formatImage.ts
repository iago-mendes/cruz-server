import dotenv from 'dotenv'
dotenv.config()

const baseUrl = String(process.env.BASE_URL)

export default function formatImage(filename: string | undefined)
{
	if (filename)
		return `${baseUrl}/uploads/${filename}`
	else
		return `${baseUrl}/assets/no-image.svg`
}