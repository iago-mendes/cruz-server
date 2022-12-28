import {Request, Response} from 'express'
import path from 'path'

import {createPdf} from '../services/pdf'
import baseUrl from '../utils/baseUrl'
import formatDate from '../utils/formatDate'
import formatNumber from '../utils/formatNumber'
import getRequest, {RequestFormated} from '../utils/requests/getRequest'

export async function createRequestPdf(request: RequestFormated) {
	const logoPath = path.join(
		__dirname,
		'..',
		'..',
		'public',
		'images',
		'logo.png'
	)
	const companyPathParts = request.representada.imagem
		.replace(baseUrl, '')
		.split('/')
		.filter(part => part != '')
	const companyPath = path.join(__dirname, '..', '..', ...companyPathParts)

	const content = [
		{
			table: {
				widths: ['*'],
				body: [
					// header
					[
						{
							columns: [
								{
									width: 100,
									image: logoPath
								},
								{
									width: '*',
									alignment: 'center',
									text: [
										{text: 'Cruz representações\n', fontSize: 15, bold: true},
										'contato@cruzrepresentacoes.com.br\n',
										'(38) 99985-6208 (38) 99986-6208 (38) 99166-5923\n',
										'\n',
										request.status.concluido ? 'Pedido' : 'Orçamento',
										'N° ',
										String(request.id)
									]
								},
								{
									width: 100,
									image: companyPath
								}
							],
							columnGap: 10
						}
					],
					// company
					[
						{
							text: [
								{text: 'Representada: ', bold: true},
								request.representada.nome_fantasia,
								' / ',
								request.representada.razao_social
							]
						}
					],
					// info
					[
						{
							columns: [
								{
									width: '*',
									text: [
										{text: 'Cliente: ', bold: true},
										request.cliente.razao_social,
										{text: '\nCNPJ: ', bold: true},
										request.cliente.cnpj,
										{text: '\nRua: ', bold: true},
										request.cliente.endereco.rua,
										{text: '\nBairro: ', bold: true},
										request.cliente.endereco.bairro,
										{text: '\nCidade: ', bold: true},
										request.cliente.endereco.cidade,
										{text: '\nTelefone: ', bold: true},
										request.cliente.telefone
									]
								},
								{
									width: '*',
									text: [
										{text: 'Nome Fantasia: ', bold: true},
										request.cliente.nome_fantasia,
										{text: '\nInscrição Estadual: ', bold: true},
										request.cliente.insc_estadual,
										{text: '\nNúmero: ', bold: true},
										request.cliente.endereco.numero,
										{text: '\nCEP: ', bold: true},
										request.cliente.endereco.cep,
										{text: '\nUF: ', bold: true},
										request.cliente.endereco.uf,
										{text: '\nE-mail: ', bold: true},
										request.cliente.email
									]
								}
							],
							columnGap: 25
						}
					],
					// products
					[
						{
							alignment: 'center',
							table: {
								widths: ['*', 40, 75, 75, 40, 40, 75],
								body: [
									[
										// header
										{text: 'Produto', bold: true},
										{text: 'Qtde.', bold: true},
										{text: 'Preço Tabela', bold: true},
										{text: 'Preço Líquido', bold: true},
										{text: 'ST', bold: true},
										{text: 'IPI', bold: true},
										{text: 'Subtotal', bold: true}
									],
									...request.produtos.map(product => {
										const imageParts = product.imagem
											.replace(baseUrl, '')
											.replace('.svg', '.png')
											.split('/')
											.filter(part => part != '')
										const imagePath = path.join(
											__dirname,
											'..',
											'..',
											...imageParts
										)

										return [
											{
												// image & name
												alignment: 'left',
												columnGap: 5,
												columns: [
													{
														width: 15,
														image: imagePath,
														fit: [15, 15]
													},
													{
														width: '*',
														text: product.codigo + ' — ' + product.nome
													}
												]
											},
											product.quantidade,
											'R$ ' + formatNumber(product.precoTabela),
											'R$ ' + formatNumber(product.preco),
											formatNumber(product.st) + ' %',
											formatNumber(product.ipi) + ' %',
											'R$ ' + formatNumber(product.subtotal)
										]
									})
								]
							}
						}
					],
					// details
					[
						{
							layout: {
								hLineWidth: function () {
									return 1
								},
								vLineWidth: function () {
									return 0
								},
								hLineColor: function () {
									return '#aaa'
								},
								paddingLeft: function (i: any) {
									return i === 0 ? 0 : 8
								},
								paddingRight: function (i: any, node: any) {
									return i === node.table.widths.length - 1 ? 0 : 8
								}
							},
							alignment: 'right',
							table: {
								widths: ['*', 100],
								body: [
									[
										// total quantity
										{text: 'Quantidade Total:', bold: true},
										request.quantidadeTotal
									],
									[
										// total volume
										{text: 'Volume:', bold: true},
										formatNumber(request.volume, 3) + ' m³'
									],
									[
										// weight
										{text: 'Peso:', bold: true},
										formatNumber(request.peso) + ' kg'
									],
									[
										// total product values
										{text: 'Total (Preço Tabela):', bold: true},
										'R$ ' +
											formatNumber(
												request.valorTotalProdutos + request.descontoTotal
											)
									],
									[
										// total product values
										{text: 'Total de Descontos:', bold: true},
										'R$ ' + formatNumber(request.descontoTotal)
									],
									[
										// total product values
										{text: 'Valor total em produtos:', bold: true},
										'R$ ' + formatNumber(request.valorTotalProdutos)
									],
									[
										// total value
										{text: 'Valor total:', bold: true},
										'R$ ' + formatNumber(request.valorTotal)
									]
								]
							}
						}
					],
					// condition & date
					[
						{
							columns: [
								{
									width: '*',
									text: [
										{text: 'Condição de Pagamento: ', bold: true},
										request.condicao
									]
								},
								{
									width: 200,
									text: [
										{text: 'Data de Emissão: ', bold: true},
										formatDate(request.data)
									]
								}
							]
						}
					],
					// seller & type
					[
						{
							columns: [
								{
									width: '*',
									text: [
										{text: 'Vendedor: ', bold: true},
										request.vendedor.nome
									]
								},
								{
									width: 200,
									text: [
										{text: 'Tipo de pedido: ', bold: true},
										request.tipo.venda ? 'Venda' : '',
										request.tipo.troca ? 'Troca' : ''
									]
								}
							]
						}
					],
					// contact & shipping
					[
						{
							columns: [
								{
									width: '*',
									text: [
										{text: 'Contato: ', bold: true},
										request.contato.nome + ' / ' + request.contato.telefone
									]
								},
								{
									width: 200,
									text: [{text: 'Frete: ', bold: true}, request.frete]
								}
							]
						}
					],
					// obs
					[
						{
							text: [{text: 'Observação: ', bold: true}, request.obs || '']
						}
					],
					// slogan
					[
						{
							text: 'Excelência em Representação Comercial!',
							alignment: 'center'
						}
					]
				]
			}
		}
	]

	return await createPdf(content)
}

const pdf = {
	request: async (req: Request, res: Response) => {
		const {requestId} = req.params

		const {request, error} = await getRequest(requestId)
		if (!request) return res.status(404).json({message: error})

		const pdf = await createRequestPdf(request)
		return res.contentType('application/pdf').send(pdf)
	},

	general: async (req: Request, res: Response) => {
		const {content} = req.body

		const pdf = await createPdf(content)
		return res.contentType('application/pdf').send(pdf)
	}
}

export default pdf
