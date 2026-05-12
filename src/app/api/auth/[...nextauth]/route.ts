import { handlers } from '@/auth'; // Importing from your Brain file

// This file simply exposes the GET and POST routes so the browser can talk to your Brain
export const { GET, POST } = handlers;
