import { getDb } from '@/db/db';
import { User } from '@/db/schema';
import {
  DocxDocumentService,
  PdfDocumentService,
  PptDocumentService,
} from '@/services/document';

import { MiddlewareFormContext } from '@/types/context.type';
import { DocumentValidation } from '@/validations/document/document.validation';
import { createMiddleware } from 'hono/factory';

type Variables = {
  user: User;
  content: string;
};

export const extractContent = createMiddleware(
  async (c: MiddlewareFormContext<DocumentValidation, Variables>, next) => {
    const db = await getDb(c);
    //const user = c.get('user');
    const { file } = c.req.valid('form');
    const bufferArr = await file.arrayBuffer();
    const buffer = Buffer.from(bufferArr);
    const fileType = file.type;
    let finalContent: string = '';
    switch (fileType) {
      case 'application/pdf':
        const pdfDocumentService = new PdfDocumentService(db, {
          documentClientEmail: c.env.GEMINI_DOCUMENT_CLIENT_EMAIL,
          documentPrivateKey: c.env.GEMINI_DOCUMENT_PRIVATE_KEY,
          documentPrivateKeyId: c.env.GEMINI_DOCUMENT_PRIVATE_KEY_ID,
        });
        finalContent = (await pdfDocumentService.extractData(buffer)).content;

        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docxDocumentService = new DocxDocumentService();
        finalContent = (await docxDocumentService.extractData(buffer)).content;
        break;

      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        const pptDocumentService = new PptDocumentService();
        finalContent = (await pptDocumentService.extractData(buffer)).content;
        break;
    }

    c.set('content', finalContent);

    return next();
  },
);
