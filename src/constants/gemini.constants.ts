import { SchemaType } from '@google/generative-ai';

export const GEMINI_CHALLENGE_CONFIG = {
  responseMimeType: 'application/json',
  responseSchema: {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.STRING,
        description: 'Título muy corto del cuestionario (máximo 5 palabras).',
        maxLength: 50,
        pattern: '^\\s*(\\S+\\s+){0,4}\\S+\\s*$',
      },
      description: {
        type: SchemaType.STRING,
        description: 'Descripción breve del desafío (máximo 2 frases).',
        maxLength: 200,
      },
      questions: {
        type: SchemaType.ARRAY,
        minItems: 7,
        maxItems: 7,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            question: {
              type: SchemaType.STRING,
              description: 'La pregunta generada.',
              maxLength: 100,
            },
            options: {
              type: SchemaType.ARRAY,
              minItems: 4,
              maxItems: 4,
              items: {
                type: SchemaType.STRING,
                description: 'Una opción de respuesta para la pregunta.',
                maxLength: 100,
              },
            },
            correctAnswerIndex: {
              type: SchemaType.INTEGER,
              description:
                'El índice (0-3) de la respuesta correcta en el array de opciones.',
              minimum: 0,
              maximum: 3,
            },
          },
          required: ['question', 'options', 'correctAnswerIndex'],
        },
      },
    },
    required: ['title', 'description', 'questions'],
  },
};
