import { Buffer } from 'buffer/';
export async function callDocumentAI(token: string, base64Pdf: Buffer) {
  const projectId = '119729326913';
  const location = 'us';
  const processorId = 'e46fad517d8272cf';

  const apiUrl = `https://${location}-documentai.googleapis.com/v1/projects/${projectId}/locations/${location}/processors/${processorId}:process`;

  const payload = {
    rawDocument: {
      content: base64Pdf,
      mimeType: 'application/pdf',
    },
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    console.error('Error - Document AI API:', await response.text());
    return null;
  }
  const data = await response.json();
  return data;
}
