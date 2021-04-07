import dotenv from 'dotenv'
dotenv.config()

const baseUrl = String(process.env.BASE_URL)

export default function formatImage(filename: string | undefined, folder = 'uploads')
{
	if (filename)
		return `${baseUrl}/${folder}/${filename}`
	else
		return `${baseUrl}/assets/no-image.svg`
}