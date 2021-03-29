const PdfPrinter = require('pdfmake')

const fonts =
{
	Roboto:
	{
		normal: 'fonts/Roboto-Regular.ttf',
		bold: 'fonts/Roboto-Medium.ttf',
		italics: 'fonts/Roboto-Italic.ttf',
		bolditalics: 'fonts/Roboto-MediumItalic.ttf'
	}
}
const printer = new PdfPrinter(fonts)

export function createPdf(content: any, options = {})
{
	const docDefinition =
	{
		content,
		pageMargins: 15,
		defaultStyle:
		{
			fontSize: 10
		}
	}

	const pdfDoc = printer.createPdfKitDocument(docDefinition, options)

	return new Promise((resolve, reject) =>
	{
		try
		{
			let chunks: any[] = []
			pdfDoc.on('data', (chunk: any) => chunks.push(chunk))
			pdfDoc.on('end', () => resolve(Buffer.concat(chunks)))
			pdfDoc.end()
		}
		catch(err)
		{
			reject(err)
		}
	})
}