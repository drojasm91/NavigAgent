import { defineConfig } from '@trigger.dev/sdk/v3'

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_ID!,
  runtime: 'node',
  logLevel: 'log',
  // 5 minutes max — enough for the longest pipeline run (Researcher + Writer + Editor)
  maxDuration: 300,
  dirs: ['lib/trigger'],
})
