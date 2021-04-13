function getRandomNumber(length: number)
{
	const randomDecimal = Math.random()
	console.log('[randomDecimal]', randomDecimal)
	const randomNumber = Math.floor(randomDecimal * (10 * length))

	return randomNumber
}

export default getRandomNumber