import fs from 'fs/promises';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { OpenAPIHono } from '@hono/zod-openapi';
import donate, { generateHtml } from './src/donate';
import actionsJson from './actions.json';
import { serveStatic } from '@hono/node-server/serve-static'

const app = new OpenAPIHono();

app.use('/static/*', serveStatic({ root: './' }))

app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Content-Encoding', 'Accept-Encoding']
}));

app.get('/actions.json', (c) => {
  return c.json(actionsJson);
});

app.get('/', async (c) => {
  const data = await fs.readFile('static/index.html', 'utf8');
  return c.html(data);
});

app.get('/donate/:base64', async (c) => {
  const renderHtml = await generateHtml(c);
  return c.html(renderHtml);
});

// <--Actions-->
app.route('/api/donate', donate);

const port = 3000;
console.log(
  `Server is running on port ${port}
Visit http://localhost:${port}/swagger-ui to explore existing actions
Visit https://actions.dialect.to to unfurl action into a Blink
`,
);

serve({
  fetch: app.fetch,
  port,
});
