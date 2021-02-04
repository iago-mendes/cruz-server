import baseUrl from "../config/baseUrl";

export default function formatImage(filename: string | undefined)
{
	if (filename)
		return `${baseUrl}/uploads/${filename}`
	else
		return `${baseUrl}/assets/no-image.png`
}