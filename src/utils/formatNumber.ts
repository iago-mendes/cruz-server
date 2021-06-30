function formatNumber(number: number | undefined, decimals = 2) {
	if (!number) return '0,00'

	const formated = number.toFixed(decimals).replace('.', ',')
	return formated
}

export default formatNumber
