import baseUrl from "../config/baseUrl";

export default function formatImage(filename: string | undefined)
{
	if (filename)
		return `${baseUrl}/uploads/${filename}`
	else
		return `${baseUrl}/uploads/assets/no-image.png`
}