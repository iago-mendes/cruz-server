import mongoose from 'mongoose'

export type ClientType = mongoose.Document &
{
	imagem?: string
	razao_social: string
	nome_fantasia: string
	cnpj: string
	insc_estadual: string
	telefone?: number
	email: string
	senha: string
	vendedores: Array<string>
	endereco:
	{
		rua?: string
		numero?: number
		complemento?: string
		bairro?: string
		cep?: number
		cidade?: string
		uf?: string
	}
	status: {ativo: boolean, aberto: boolean, nome_sujo: boolean}
	condicoes: {prazo: boolean, cheque: boolean, vista: boolean}
	representadas: Array<
	{
		id: string
		tabela: string
	}>
}

const ClientSchema = new mongoose.Schema(
{
	imagem: {type: String, required: false},
	razao_social: {type: String, required: true},
	nome_fantasia: {type: String, required: true},
	cnpj: {type: String, required: true},
	insc_estadual: {type: String, required: true},
	telefone: {type: Number, required: false},
	email: {type: String, required: true},
	senha: {type: String, required: true},
	vendedores: [{type: mongoose.Schema.Types.ObjectId, ref: 'Vendedor'}],
	endereco:
	{
		rua: {type: String, required: false},
		numero: {type: Number, required: false},
		bairro: {type: String, required: false},
		cep: {type: Number, required: false},
		cidade: {type: String, required: false},
		uf: {type: String, required: false}
	},
	status:
	{
		ativo: {type: Boolean, required: true},
		aberto: {type: Boolean, required: true},
		nome_sujo: {type: Boolean, required: true}
	},
	condicoes:
	{
		prazo: {type: Boolean, required: true},
		cheque: {type: Boolean, required: true},
		vista: {type: Boolean, required: true}
	},
	representadas:
	[{
		id: {type: mongoose.Schema.Types.ObjectId, ref: 'Representada', required: true},
		tabela: {type: mongoose.Schema.Types.ObjectId, ref: 'Representada.tabelas', required: true}
	}]
})

export default mongoose.model<ClientType>('Cliente', ClientSchema)