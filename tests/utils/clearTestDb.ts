import {connectToTestDb} from './connectToTestDb'

export async function clearTestDb() {
	const connection = await connectToTestDb()
	await connection.dropDatabase()
}
