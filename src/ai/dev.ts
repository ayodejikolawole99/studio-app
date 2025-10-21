'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-employee-consumption-trends.ts';
import '@/ai/flows/create-employee-flow.ts';
