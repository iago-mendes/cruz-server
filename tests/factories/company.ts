import faker from 'faker'

import {getObjectId} from '../utils/getObjectId'

export const companyDefinition = {
	_id: getObjectId(),
	razao_social: faker.name.findName(),
	nome_fantasia: faker.company.companyName(),
	cnpj: '10.671.781/0001-08',
	telefones: [faker.phone.phoneNumber()],
	email: faker.internet.email(),
	comissao: {porcentagem: faker.datatype.number(10), obs: []},
	descricao_curta: faker.company.catchPhraseDescriptor(),
	descricao: faker.lorem.words(100),
	site: faker.internet.url(),
	tabelas: [
		{_id: getObjectId(), nome: 'Padrão'},
		{_id: getObjectId(), nome: 'Atacado Moc'},
		{_id: getObjectId(), nome: 'Atacado Região'}
	],
	condicoes: [
		{_id: getObjectId(), nome: 'Boleto 14 dias', precoMin: 1000},
		{_id: getObjectId(), nome: 'Boleto 28 dias', precoMin: 1500},
		{_id: getObjectId(), nome: 'Boleto 36 dias', precoMin: 2000}
	]
}
