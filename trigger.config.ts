import { defineConfig } from '@trigger.dev/sdk/v3'

export default defineConfig({
  project: 'prj_0a4tI2AoFl3kbZkC4amErbqelWJM',
  runtime: 'node',
  logLevel: 'log',
  // 5 minutes max — enough for the longest pipeline run (Researcher + Writer + Editor)
  maxDuration: 300,
  dirs: ['lib/trigger'],
})
