import { Content, Part } from '@google/generative-ai';

export function createContent(
  text: string,
  instructions?: string,
  ...images: any
): Content[] {
  const imageParts: Part[] = images.map((image: any) => {
    return {
      inlineData: {
        mimeType: image.mimetype,
        data: image.buffer.toString('base64'),
      },
    };
  });
  return [
    {
      role: 'user',
      parts: [
        ...(instructions ? [{ text: instructions }] : []),
        ...imageParts,
        {
          text,
        },
      ],
    },
  ];
}
