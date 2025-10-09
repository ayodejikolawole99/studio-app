'use server';

/**
 * @fileOverview Analyzes employee feeding data to identify trends, peak hours, and popular food items.
 *
 * - analyzeEmployeeConsumptionTrends - A function that handles the analysis of employee consumption trends.
 * - AnalyzeEmployeeConsumptionTrendsInput - The input type for the analyzeEmployeeConsumptionTrends function.
 * - AnalyzeEmployeeConsumptionTrendsOutput - The return type for the analyzeEmployeeConsumptionTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeEmployeeConsumptionTrendsInputSchema = z.object({
  feedingData: z.string().describe('JSON string containing the feeding data of employees, including timestamps and employee IDs.'),
});
export type AnalyzeEmployeeConsumptionTrendsInput = z.infer<typeof AnalyzeEmployeeConsumptionTrendsInputSchema>;

const AnalyzeEmployeeConsumptionTrendsOutputSchema = z.object({
  trends: z.string().describe('A summary of the identified trends in employee ticket printing habits.'),
  peakHours: z.string().describe('The peak hours during which employees print tickets at the canteen.'),
  overallAnalysis: z.string().describe('An overall analysis of the employee consumption patterns, including suggestions for optimizing canteen resources and reducing waste.'),
});
export type AnalyzeEmployeeConsumptionTrendsOutput = z.infer<typeof AnalyzeEmployeeConsumptionTrendsOutputSchema>;

export async function analyzeEmployeeConsumptionTrends(
    input: AnalyzeEmployeeConsumptionTrendsInput
): Promise<AnalyzeEmployeeConsumptionTrendsOutput> {
  const result = await analyzeEmployeeConsumptionTrendsFlow(input);
  return result;
}

const prompt = ai.definePrompt({
  name: 'analyzeEmployeeConsumptionTrendsPrompt',
  input: {schema: AnalyzeEmployeeConsumptionTrendsInputSchema},
  output: {schema: AnalyzeEmployeeConsumptionTrendsOutputSchema},
  prompt: `You are an AI assistant specializing in analyzing employee canteen consumption data to identify trends and provide insights for resource optimization and waste reduction.

  Analyze the following employee feeding data, which tracks ticket printing times, provided as a JSON string:
  {{{feedingData}}}

  Based on this data, identify:
  - Key trends in employee ticket printing habits (e.g., daily patterns, weekly variations).
  - Peak hours for canteen ticket printing.
  - An overall analysis of consumption patterns, including actionable suggestions for optimizing canteen resources and minimizing waste based on when tickets are printed.
  
  Do not mention "food items" in your analysis, as the data only tracks ticket printing events.

  Ensure the output is clear, concise, and actionable for canteen management.
`,
});

const analyzeEmployeeConsumptionTrendsFlow = ai.defineFlow(
  {
    name: 'analyzeEmployeeConsumptionTrendsFlow',
    inputSchema: AnalyzeEmployeeConsumptionTrendsInputSchema,
    outputSchema: AnalyzeEmployeeConsumptionTrendsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
