import { tool, zodSchema } from 'ai';
import { z } from 'zod';
import { insertMedication, getAllMedications, Medication } from '../db';

export const addMedicationReminderTool = tool({
  description: "Add a medication reminder to the patient's medication list.",
  inputSchema: zodSchema(z.object({
    name: z.string().describe('Medication name (e.g., "Metformin", "Insulin Glargine")'),
    dose: z.string().describe('Dose (e.g., "500mg", "10 units")'),
    schedule_time: z.string().describe('When to take it (e.g., "8:00 AM", "with breakfast", "bedtime")'),
    notes: z.string().optional().describe('Optional additional notes (e.g., "take with food", "check blood sugar first")'),
  })),
  execute: async (input) => {
    try {
      const medication = await insertMedication(input.name, input.dose, input.schedule_time, input.notes);
      return {
        success: true,
        medication,
        message: `Added reminder: ${input.name} ${input.dose} at ${input.schedule_time}`,
      };
    } catch (err) {
      console.error('[medicationTools] insertMedication failed:', err);
      return { success: false, medication: null, error: 'Failed to save the medication reminder. Please try again.' };
    }
  },
});

export const listMedicationsTool = tool({
  description: 'List all current medication reminders for the patient.',
  inputSchema: zodSchema(z.object({})),
  execute: async (): Promise<{ medications: Medication[]; count: number }> => {
    const medications = await getAllMedications();
    return { medications, count: medications.length };
  },
});
