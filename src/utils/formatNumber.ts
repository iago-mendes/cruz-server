function formatNumber(number: number | undefined)
{
	if (!number)
		return '0,00'
	
	const formated = number.toFixed(2).replace('.', ',')
	return formated
}

export default formatNumber