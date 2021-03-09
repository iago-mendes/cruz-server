export default function formatDate(hash: string)
{
	let [year, month, day] = hash.split('-')

	if (month.length === 1)
		month = 0 + month
	if (day.length === 1)
		day = 0 + day

	const formatedDate = day + '/' + month + '/' + year
	return formatedDate
}