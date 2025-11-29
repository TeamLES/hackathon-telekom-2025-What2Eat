import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Allow responses up to 30 seconds
export const maxDuration = 30;

// Define the schema for the output
const ingredientsSchema = z.object({
  ingredients: z.array(z.string()).describe("A list of ingredients found in the image, as a JSON array of strings."),
});

export async function POST(req: Request) {
  try {
    const { image }: { image: string } = await req.json();

    if (!image) {
      return new Response(JSON.stringify({ error: 'Image data is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { object } = await generateObject({
      model: openai('gpt-4-vision-preview'),
      schema: ingredientsSchema,
      messages: [
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: 'What ingredients are in this image? Please identify them and return them as a JSON object with an "ingredients" key containing an array of strings.' 
            },
            {
              type: 'image',
              image: image, // Pass the data URL string directly
            },
          ],
        },
      ],
    });

    return Response.json(object);

  } catch (error) {
    console.error('Error analyzing image:', error);
    return new Response(JSON.stringify({ error: 'Failed to analyze image.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
