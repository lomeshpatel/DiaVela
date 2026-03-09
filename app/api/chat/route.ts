import { streamText, convertToModelMessages, stepCountIs, UIMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { logGlucoseReadingTool, getGlucoseTrendsTool } from '@/lib/tools/glucoseTools';
import { searchNutritionTool } from '@/lib/tools/nutritionTools';
import { addMedicationReminderTool, listMedicationsTool } from '@/lib/tools/medicationTools';
import { searchDiabetesKnowledgeTool } from '@/lib/tools/knowledgeTools';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are DiaVela, a compassionate and knowledgeable AI diabetes care assistant. You help patients manage their diabetes through four areas:

1. **Blood Glucose Tracking**: Log readings, identify trends, explain what values mean
2. **Diet & Nutrition**: Look up carbs/calories using USDA data, explain meal planning for diabetes
3. **Medication Reminders**: Track medications and remind about schedules
4. **Diabetes Education**: Answer questions using evidence-based diabetes knowledge

**Safety Guidelines (CRITICAL)**:
- Always remind users to consult their healthcare provider for medical decisions
- Never recommend changing insulin doses or prescriptions
- For urgent symptoms (severe hypoglycemia, DKA signs), immediately direct to emergency services
- Provide information and support, not medical diagnoses or treatment prescriptions

**Tone**: Warm, encouraging, non-judgmental. Diabetes management is hard — celebrate progress.

**Tool Usage**:
- Use \`log_glucose_reading\` when a user mentions their blood sugar level
- Use \`get_glucose_trends\` to show patterns and history
- Use \`search_nutrition\` for food/carb questions (always prefer real USDA data over estimates)
- Use \`search_diabetes_knowledge\` for educational questions before answering
- Use medication tools to track and remind about medications

Always use tools when relevant. After tool results, provide a helpful, personalized response.`;

function getModel() {
  const provider = (process.env.AI_PROVIDER ?? 'gemini').toLowerCase();
  const modelId = process.env.AI_MODEL;
  if (provider === 'gemini') return google(modelId ?? 'gemini-2.5-flash');
  if (provider === 'anthropic') return anthropic(modelId ?? 'claude-sonnet-4-6');
  throw new Error(`Unknown AI_PROVIDER "${provider}". Valid: gemini, anthropic`);
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: {
      log_glucose_reading: logGlucoseReadingTool,
      get_glucose_trends: getGlucoseTrendsTool,
      search_nutrition: searchNutritionTool,
      add_medication_reminder: addMedicationReminderTool,
      list_medications: listMedicationsTool,
      search_diabetes_knowledge: searchDiabetesKnowledgeTool,
    },
    stopWhen: stepCountIs(10),
  });

  return result.toUIMessageStreamResponse();
}
