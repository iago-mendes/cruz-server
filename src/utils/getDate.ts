export function getDate() {
	const dateObj = new Date(Date.now())
	const formatedDate = dateObj.toISOString().replace('T', ' ').replace('Z', '')

	return formatedDate
}
