import {RequestType} from '../../models/Request'
import {CompanyType} from '../../models/Company'
import {ClientType} from '../../models/Client'
import formatImage from '../formatImage'

interface Product
{
	id: string
	nome: string
	imagem: string
	quantidade: number
	preco: number
	precoTabela: number
	ipi: number
	st: number
	codigo: number
	subtotal: number
}

function getPricedProducts(request: RequestType, company: CompanyType, client: ClientType)
{
	let totalValue = 0
	let totalProductsValue = 0
	let totalDiscount = 0
	let totalQuantity = 0

	let products: Product[] = []
	request.produtos.map(productSold =>
	{
		const product = company.produtos.find(product => String(product._id) == String(productSold.id))
		if (!product)
			return

		const clientCompany = client.representadas.find(tmpCompany => String(tmpCompany.id) == String(company._id))
		if (!clientCompany)
			return

		const tableId = clientCompany.tabela

		// const clientProduct = line.produtos.find(tmpProduct => String(tmpProduct._id) == String(product._id))
		// if (!clientProduct)
		// 	return

		// const table = clientProduct.tabelas.find(tmpTable => String(tmpTable.id) == String(tableId))
		const table = product.tabelas.find(tmpTable => String(tmpTable.id) == String(tableId))
		if (!table)
			return
		
		const tablePrice = table.preco
		
		const subtotal = productSold.quantidade*productSold.preco
			+productSold.quantidade*productSold.preco*product.ipi/100
			+productSold.quantidade*productSold.preco*product.st/100

		totalProductsValue += productSold.quantidade*productSold.preco
		totalValue += subtotal
		totalDiscount += (tablePrice-productSold.preco)*productSold.quantidade

		totalQuantity += productSold.quantidade

		const tmpProduct =
		{
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

	return {totalValue, totalProductsValue, totalDiscount, products, totalQuantity}
}

export default getPricedProducts