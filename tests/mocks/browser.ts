import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Setup MSW worker for browser environment (if needed for E2E)
export const worker = setupWorker(...handlers);

