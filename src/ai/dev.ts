'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/intelligent-error-explanation.ts';
import '@/ai/flows/submit-document-flow.ts';
