import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';

const MAX_PPTX_SLIDES = 10;

export class PptDocumentService {
  constructor() {}

  public async extractData(buffer: Buffer): Promise<{ content: string }> {
    const slidesText = await this.extractText(buffer);
    const totalSlides = slidesText.length;
    const selectedText = await this.getRandomSlides(
      slidesText,
      totalSlides,
      MAX_PPTX_SLIDES,
    );

    return { content: selectedText.trim() };
  }

  private async extractText(buffer: Buffer): Promise<string[]> {
    const zip = await JSZip.loadAsync(buffer);
    const parser = new XMLParser();

    const slideFiles = Object.keys(zip.files)
      .filter(
        (filename) =>
          filename.startsWith('ppt/slides/slide') && filename.endsWith('.xml'),
      )
      .sort();

    const slidesText: string[] = [];

    for (const slideFile of slideFiles) {
      const slideXml = await zip.files[slideFile].async('string');
      const slideContent = parser.parse(slideXml);
      const texts = this.extractTextFromSlideContent(slideContent);
      slidesText.push(texts.join(' '));
    }
    return slidesText;
  }

  private extractTextFromSlideContent(slideContent: any): string[] {
    const texts: string[] = [];
    const extractTextRecursively = (obj: any) => {
      if (!obj) return;
      if (typeof obj === 'object') {
        for (const key in obj) {
          if (key === 'a:t') {
            texts.push(obj[key]);
          } else {
            extractTextRecursively(obj[key]);
          }
        }
      } else if (Array.isArray(obj)) {
        for (const item of obj) {
          extractTextRecursively(item);
        }
      }
    };

    extractTextRecursively(slideContent);
    return texts;
  }

  private async getRandomSlides(
    slidesText: string[],
    totalSlides: number,
    slidesToSelect: number,
  ): Promise<string> {
    if (slidesToSelect >= totalSlides) return slidesText.join('\n');
    const slideIndices = Array.from({ length: totalSlides }, (_, i) => i)
      .sort(() => Math.random() - 0.5)
      .slice(0, slidesToSelect);
    let selectedText = '';
    for (const slideIndex of slideIndices) {
      selectedText += slidesText[slideIndex] + '\n';
    }
    return selectedText;
  }
}
