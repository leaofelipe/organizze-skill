import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

export function getCredentials() {
  const email = process.env.ORGANIZZE_EMAIL;
  const token = process.env.ORGANIZZE_TOKEN;
  const userAgent = process.env.ORGANIZZE_USER_AGENT;

  if (!email || !token || !userAgent) {
    throw new Error(
      'Missing required environment variables: ORGANIZZE_EMAIL, ORGANIZZE_TOKEN, ORGANIZZE_USER_AGENT\n' +
        'Set them in Claude Desktop MCP config, export them in the shell, or copy .env.example to .env and fill in your credentials.',
    );
  }

  return { email, token, userAgent };
}
