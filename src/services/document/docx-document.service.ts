import * as mammoth from 'mammoth';

const MAX_DOCX_PAGES = 10;
const PAGE_SIZE = 2800;

export class DocxDocumentService {
  constructor() {}

  public async extractData(buffer: Buffer): Promise<{ content: string }> {
    const text = await this.extractText(buffer);
    const totalPages = Math.ceil(text.length / PAGE_SIZE);
    const selectedText = await this.getRandomPages(
      text,
      totalPages,
      MAX_DOCX_PAGES,
    );

    return { content: selectedText.trim() };
  }

  private async extractText(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      return result.value || '';
    } catch (error) {
      throw new Error('Unable to process .docx document');
    }
  }

  private async getRandomPages(
    text: string,
    totalPages: number,
    pagesToSelect: number,
  ): Promise<string> {
    if (pagesToSelect >= totalPages) return text;
    const pageIndices = Array.from({ length: totalPages }, (_, i) => i)
      .sort(() => 0.5 - Math.random())
      .slice(0, pagesToSelect);
    let selectedText = '';
    for (const pageIndex of pageIndices) {
      const start = pageIndex * PAGE_SIZE;
      const end = Math.min(start + PAGE_SIZE, text.length);
      selectedText += text.substring(start, end) + '\n';
    }

    return selectedText;
  }
}
