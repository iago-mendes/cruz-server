import bcrypt from 'bcrypt'

function encryptPwd(pwd: string) {
	const hash = bcrypt.hashSync(pwd, 10)
	return hash
}

export default encryptPwd
