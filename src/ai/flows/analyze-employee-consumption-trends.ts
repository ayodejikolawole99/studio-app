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
  feedingData: z.string().describe('JSON string containing the feeding data of employees, including timestamps, employee IDs, and food items consumed.'),
});
export type AnalyzeEmployeeConsumptionTrendsInput = z.infer<typeof AnalyzeEmployeeConsumptionTrendsInputSchema>;

const AnalyzeEmployeeConsumptionTrendsOutputSchema = z.object({
  trends: z.string().describe('A summary of the identified trends in employee feeding habits.'),
  peakHours: z.string().describe('The peak hours during which employees consume food at the canteen.'),
  popularFoodItems: z.string().describe('A list of the most popular food items consumed by employees.'),
  overallAnalysis: z.string().describe('An overall analysis of the employee consumption patterns, including suggestions for optimizing canteen resources and reducing waste.'),
});
export type AnalyzeEmployeeConsumptionTrendsOutput = z.infer<typeof AnalyzeEmployeeConsumptionTrendsOutputSchema>;

export async function analyzeEmployeeConsumptionTrends(
    input: AnalyzeEmployeeConsumptionTrendsInput
): Promise<AnalyzeEmployeeConsumptionTrendsOutput> {
  return analyzeEmployeeConsumptionTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeEmployeeConsumptionTrendsPrompt',
  input: {schema: AnalyzeEmployeeConsumptionTrendsInputSchema},
  output: {schema: AnalyzeEmployeeConsumptionTrendsOutputSchema},
  prompt: `You are an AI assistant specializing in analyzing employee canteen consumption data to identify trends and provide insights for resource optimization and waste reduction.

  Analyze the following employee feeding data, provided as a JSON string:
  {{{feedingData}}}

  Based on this data, identify:
  - Key trends in employee feeding habits.
  - Peak hours for canteen usage.
  - The most popular food items among employees.
  - An overall analysis of consumption patterns, including actionable suggestions for optimizing canteen resources and minimizing waste.

  Ensure the output is clear, concise, and actionable for canteen management.

  Output should be formatted according to the following schema descriptions:
  trends: {{{output.schema.shape.trends.description}}}
  peakHours: {{{output.schema.shape.peakHours.description}}}
  popularFoodItems: {{{output.schema.shape.popularFoodItems.description}}}
  overallAnalysis: {{{output.schema.shape.overallAnalysis.description}}}
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
