function compareIds(id1: unknown, id2: unknown) {
	const areTheSame = String(id1) == String(id2)
	return areTheSame
}

export default compareIds
