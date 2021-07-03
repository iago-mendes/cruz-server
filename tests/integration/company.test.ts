import {api, keyHeader} from '../api'
import factory from '../factories'

describe('Company', () => {
	it('should create company', async () => {
		const company: Record<string, unknown> = await factory.create('Company')
		console.log('<< company >>', company)
		const res = await api
			.post('/companies')
			.type('form')
			.set(keyHeader)
			.send(company)
		// console.log('<< res >>', res)

		expect(res.status).toBe(201)
	})
})
