import {RequestType} from '../../models/Request'
import {CompanyType} from '../../models/Company'
import {ClientType} from '../../models/Client'
import formatImage from '../formatImage'

export interface Product {
	id: string
	nome: string
	imagem: string
	quantidade: number
	preco: number
	precoTabela: number
	ipi: number
	st: number
	codigo: string
	subtotal: number
}

function getPricedProducts(
	request: RequestType,
	company: CompanyType,
	client: ClientType
) {
	let totalValue = 0
	let totalProductsValue = 0
	let totalDiscount = 0
	let totalQuantity = 0

	let weight = 0
	let volume = 0

	const products: Product[] = []
	request.produtos.map(productSold => {
		const product = company.produtos.find(
			product => String(product._id) == String(productSold.id)
		)
		if (!product) return

		const clientCompany = client.representadas.find(
			tmpCompany => String(tmpCompany.id) == String(company._id)
		)
		const tableId = clientCompany ? clientCompany.tabela : undefined
		const clientTable = tableId
			? product.tabelas.find(tmpTable => String(tmpTable.id) == String(tableId))
			: undefined

		const table = clientTable ? clientTable : product.tabelas[0]

		const tablePrice = table.preco

		const subtotal =
			productSold.quantidade * productSold.preco +
			(productSold.quantidade * productSold.preco * product.ipi) / 100 +
			(productSold.quantidade * productSold.preco * product.st) / 100

		totalProductsValue += productSold.quantidade * productSold.preco
		totalValue += subtotal
		totalDiscount += (tablePrice - productSold.preco) * productSold.quantidade

		totalQuantity += productSold.quantidade

		if (product.peso) weight += product.peso
		if (product.volume) volume += product.volume

		const tmpProduct = {
			id: String(product._id),
			nome: product.nome,
			imagem: formatImage(product.imagem),
			quantidade: productSold.quantidade,
			preco: productSold.preco,
			precoTabela: tablePrice,
			ipi: product.ipi,
			st: product.st,
			codigo: product.codigo,
			subtotal
		}
		products.push(tmpProduct)
	})

	return {
		totalValue,
		totalProductsValue,
		totalDiscount,
		products,
		totalQuantity,
		weight,
		volume
	}
}

export default getPricedProducts
