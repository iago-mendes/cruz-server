import fs from 'fs'
import path from 'path'
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

export function createPdf(filename: string, docDefinition = {}, options = {})
{
	const pdfDoc = printer.createPdfKitDocument(docDefinition, options)

	const pdfPath = path.join(__dirname, '..', '..', 'tmp', filename)
	pdfDoc.pipe(fs.createWriteStream(pdfPath))

	pdfDoc.end()
}