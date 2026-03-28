import { tool, zodSchema } from 'ai';
import { z } from 'zod';

export interface NutrientInfo {
  name: string;
  amount: number;
  unit: string;
}

export interface FoodItem {
  fdcId: number;
  description: string;
  nutrients: {
    calories?: NutrientInfo;
    carbohydrates?: NutrientInfo;
    protein?: NutrientInfo;
    fat?: NutrientInfo;
    fiber?: NutrientInfo;
    sugar?: NutrientInfo;
  };
}

export interface NutritionResult {
  query: string;
  foods: FoodItem[];
  error?: string;
}

const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';

const NUTRIENT_IDS: Record<string, keyof FoodItem['nutrients']> = {
  '208': 'calories',
  '205': 'carbohydrates',
  '203': 'protein',
  '204': 'fat',
  '291': 'fiber',
  '269': 'sugar',
};

export const searchNutritionTool = tool({
  description: 'Look up nutritional information (carbohydrates, calories, protein, fat) for a food item using the USDA FoodData Central database.',
  inputSchema: zodSchema(z.object({
    food_query: z.string().describe('The food item to search for (e.g., "oatmeal", "apple", "grilled chicken breast")'),
  })),
  execute: async (input): Promise<NutritionResult> => {
    const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY';

    try {
      const searchUrl = `${USDA_API_BASE}/foods/search?query=${encodeURIComponent(input.food_query)}&pageSize=3&api_key=${apiKey}`;
      const response = await fetch(searchUrl);

      if (!response.ok) {
        return { query: input.food_query, foods: [], error: `USDA API error: ${response.status}` };
      }

      const data = await response.json();

      const foods: FoodItem[] = (data.foods || []).slice(0, 3).map((food: {
        fdcId: number;
        description: string;
        foodNutrients?: Array<{ nutrientId: number; value: number; unitName: string }>;
      }) => {
        const nutrients: FoodItem['nutrients'] = {};
        for (const nutrient of food.foodNutrients || []) {
          const key = NUTRIENT_IDS[String(nutrient.nutrientId)];
          if (key) {
            nutrients[key] = {
              name: key,
              amount: Math.round(nutrient.value * 10) / 10,
              unit: nutrient.unitName || (key === 'calories' ? 'kcal' : 'g'),
            };
          }
        }
        return { fdcId: food.fdcId, description: food.description, nutrients };
      });

      return { query: input.food_query, foods };
    } catch (error) {
      console.error('[nutritionTools] USDA API request failed for query:', input.food_query, error);
      return {
        query: input.food_query,
        foods: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
