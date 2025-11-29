import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Allow responses up to 60 seconds for image processing
export const maxDuration = 60;

// Schema for detected ingredients with confidence scores
const ingredientsSchema = z.object({
  ingredients: z
    .array(
      z.object({
        name: z.string().describe("The name of the ingredient in English"),
        confidence: z
          .number()
          .min(0)
          .max(1)
          .describe("Confidence score between 0 and 1"),
        category: z
          .string()
          .optional()
          .describe(
            "Category like 'vegetable', 'fruit', 'dairy', 'meat', 'condiment', etc."
          ),
      })
    )
    .describe("List of ingredients detected in the image"),
});

export type DetectedIngredient = z.infer<
  typeof ingredientsSchema
>["ingredients"][number];

export async function POST(req: Request) {
  try {
    const { image, saveToStorage = false }: { image: string; saveToStorage?: boolean } =
      await req.json();

    if (!image) {
      return Response.json({ error: "Image data is required." }, { status: 400 });
    }

    // Validate it's a proper data URL
    if (!image.startsWith("data:image/")) {
      return Response.json(
        { error: "Invalid image format. Expected a data URL." },
        { status: 400 }
      );
    }

    // Use GPT-4o which has excellent vision capabilities
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: ingredientsSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert at identifying food ingredients from images of refrigerators, pantries, and kitchen shelves.

Analyze this image and identify ALL visible food ingredients. For each ingredient:
1. Provide the common name in English (e.g., "eggs", "milk", "tomatoes")
2. Estimate your confidence (0.0 to 1.0) based on how clearly you can see it
3. Categorize it (vegetable, fruit, dairy, meat, seafood, grain, condiment, beverage, etc.)

Be thorough - look for:
- Items on shelves and in drawers
- Partially visible items
- Items in containers (try to identify what's inside if possible)
- Bottles, jars, and packaged goods

Only include food items that can be used as cooking ingredients. Skip non-food items.
If you're unsure about an item, include it with a lower confidence score.`,
            },
            {
              type: "image",
              image: image,
            },
          ],
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent results
    });

    // If saveToStorage is true, save to Supabase
    let snapshotId: number | null = null;
    
    if (saveToStorage) {
      const supabase = await createClient();
      
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!userError && user) {
        try {
          // Convert data URL to blob for storage
          const base64Data = image.split(",")[1];
          const contentType = image.split(";")[0].split(":")[1];
          const blob = Buffer.from(base64Data, "base64");
          
          // Generate unique filename
          const timestamp = Date.now();
          const fileName = `${user.id}/${timestamp}.jpg`;
          
          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from("fridge-photos")
            .upload(fileName, blob, {
              contentType,
              upsert: false,
            });

          if (uploadError) {
            console.error("Failed to upload image:", uploadError);
          } else {
            // Save snapshot record to database
            const { data: snapshot, error: snapshotError } = await supabase
              .from("fridge_snapshots")
              .insert({
                user_id: user.id,
                bucket_id: "fridge-photos",
                object_path: fileName,
                detected_raw: object,
              })
              .select("id")
              .single();

            if (snapshotError) {
              console.error("Failed to save snapshot:", snapshotError);
            } else if (snapshot) {
              snapshotId = snapshot.id;
              
              // Save individual ingredient detections
              const ingredientItems = object.ingredients.map((ing) => ({
                snapshot_id: snapshot.id,
                detected_name: ing.name,
                confidence: ing.confidence,
              }));

              if (ingredientItems.length > 0) {
                const { error: itemsError } = await supabase
                  .from("fridge_snapshot_items")
                  .insert(ingredientItems);

                if (itemsError) {
                  console.error("Failed to save snapshot items:", itemsError);
                }
              }
            }
          }
        } catch (storageError) {
          console.error("Storage error:", storageError);
          // Continue even if storage fails - still return the detected ingredients
        }
      }
    }

    // Return the detected ingredients (simplified format for the UI)
    return Response.json({
      ingredients: object.ingredients.map((i) => i.name),
      detailedIngredients: object.ingredients,
      snapshotId,
    });
  } catch (error) {
    console.error("Error analyzing image:", error);
    
    // Check if it's an API key error
    if (error instanceof Error && error.message.includes("API key")) {
      return Response.json(
        { error: "OpenAI API configuration error. Please check the API key." },
        { status: 500 }
      );
    }
    
    return Response.json(
      { error: "Failed to analyze image. Please try again." },
      { status: 500 }
    );
  }
}
