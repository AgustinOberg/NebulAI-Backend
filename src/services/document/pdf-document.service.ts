import { DrizzleD1Database } from 'drizzle-orm/d1';
import { getDocumentProxy } from 'unpdf';
import { getJWTFromServiceAccount } from '@/config/google-auth';
import { callDocumentAI } from '@/config/google-document';
import { PDFDocument } from 'pdf-lib';

const MAX_PDF_PAGES = 10;

type OcrCredentials = {
  documentClientEmail: string;
  documentPrivateKey: string;
  documentPrivateKeyId: string;
};

export class PdfDocumentService {
  constructor(
    private db: DrizzleD1Database,
    private ocrCredentials: OcrCredentials,
  ) {}

  async extractData(buffer: Buffer) {
    const pagesQuantity = await this.countPages(buffer);
    const pagesToSelect = Math.min(MAX_PDF_PAGES, pagesQuantity);

    const randomPageIndexes = Array.from({ length: pagesQuantity }, (_, i) => i)
      .sort(() => 0.5 - Math.random())
      .slice(0, pagesToSelect);

    const text = await this.extractTextWithoutOcr(buffer, randomPageIndexes);

    const needsOcr = text.length < 10;
    if (!needsOcr) return { content: text };

    const selectedPagesBuffer = await this.extractSelectedPages(
      buffer,
      randomPageIndexes,
    );

    const ocrText = await this.extractTextWithOcr(selectedPagesBuffer);
    return { content: ocrText };
  }

  private async countPages(buffer: Buffer): Promise<number> {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    return pdf.numPages;
  }

  private async extractTextWithoutOcr(
    buffer: Buffer,
    pages: number[],
  ): Promise<string> {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    let extractedText = '';
    for (const pageIndex of pages) {
      const page = await pdf.getPage(pageIndex + 1);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      extractedText += pageText + '\n';
    }

    return extractedText.trim();
  }

  private async extractSelectedPages(
    buffer: Buffer,
    pages: number[],
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(buffer);
    const newPdfDoc = await PDFDocument.create();

    for (const pageIndex of pages) {
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageIndex]);
      newPdfDoc.addPage(copiedPage);
    }

    const pdfBytes = await newPdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private async extractTextWithOcr(buffer: any): Promise<string> {
    const token = await getJWTFromServiceAccount(
      {
        client_email: this.ocrCredentials.documentClientEmail,
        private_key: this.ocrCredentials.documentPrivateKey,
        private_key_id: this.ocrCredentials.documentPrivateKeyId,
      },
      { aud: 'https://documentai.googleapis.com/' },
    );

    const document = (await callDocumentAI(
      token,
      buffer.toString('base64'),
    )) as any;

    if (!document) return '';
    return document.document.text;
  }
}
