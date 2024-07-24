import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  VersionedTransaction,
} from '@solana/web3.js';
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import {
  actionSpecOpenApiPostRequestBody,
  actionsSpecOpenApiGetResponse,
  actionsSpecOpenApiPostResponse,
} from './openapi';
import { prepareTransaction } from './shared/transaction-utils';
import { ActionGetResponse, ActionPostRequest, ActionPostResponse } from '@solana/actions';
import { html } from 'hono/html'

import dotenv from 'dotenv';
dotenv.config();

const app = new OpenAPIHono();

const createDonateRouteHandler = (method: 'get' | 'post') => {
  return (c: any) => {
    const base64 = c.req.param('base64');
    const data = Buffer.from(base64, 'base64').toString('utf-8');
    const userData = JSON.parse(data);

    const { icon, title, description, label, amount_options: amountOptions, address } = userData;

    const amountParameterName = 'amount';
    const response: ActionGetResponse = {
      icon,
      label: `${label}`,
      title,
      description,
      links: {
        actions: [
          ...amountOptions.map((amount) => ({
            label: `${amount} SOL`,
            href: `/api/donate/${address}/${amount}`,
          })),
          {
            href: `/api/donate/${address}/{${amountParameterName}}`,
            label: 'Donate',
            parameters: [
              {
                name: amountParameterName,
                label: 'Enter a custom SOL amount',
              },
            ],
          },
        ],
      },
    };

    return c.json(response, 200);
  };
};

app.openapi(
  createRoute({
    method: 'get',
    path: '/{base64}',
    tags: ['Donate'],
    responses: actionsSpecOpenApiGetResponse,
  }),
  createDonateRouteHandler('get'),
);

app.openapi(
  createRoute({
    method: 'post',
    path: '/{base64}',
    tags: ['Donate'],
    responses: actionsSpecOpenApiGetResponse,
  }),
  createDonateRouteHandler('post'),
);

app.openapi(
  createRoute({
    method: 'post',
    path: '/{address}/{amount}',
    tags: ['Donate'],
    request: {
      params: z.object({
        address: z.string().openapi({
          param: {
            name: 'address',
            in: 'path',
            required: true,
          },
          example: 'address',
        }),
        amount: z
          .string()
          .optional()
          .openapi({
            param: {
              name: 'amount',
              in: 'path',
              required: false,
            },
            type: 'number',
            example: '1',
          }),
      }),
      body: actionSpecOpenApiPostRequestBody,
    },
    responses: actionsSpecOpenApiPostResponse,
  }),
  async (c) => {
    const address = c.req.param('address');
    const amount = c.req.param('amount');
    const { account } = (await c.req.json()) as ActionPostRequest;

    const parsedAmount = parseFloat(amount);
    const transaction = await prepareDonateTransaction(
      new PublicKey(account),
      new PublicKey(address),
      parsedAmount * LAMPORTS_PER_SOL,
    );
    const response: ActionPostResponse = {
      transaction: Buffer.from(transaction.serialize()).toString('base64'),
    };

    return c.json(response, 200);
  },
);

async function prepareDonateTransaction(
  sender: PublicKey,
  recipient: PublicKey,
  lamports: number,
): Promise<VersionedTransaction> {
  const payer = new PublicKey(sender);
  const instructions = [
    SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: new PublicKey(recipient),
      lamports: lamports,
    }),
  ];
  return prepareTransaction(instructions, payer);
}

export default app;

export async function generateHtml(c) {
  const base64 = c.req.param('base64');
  const data = Buffer.from(base64, 'base64').toString('utf-8');
  const userData = JSON.parse(data);
  const { icon, title, description, label, amount_options, address } = userData;

  const domain = process.env.DOMAIN_URL || 'http://localhost:3000';

  const renderHtml = (
    html`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!-- Twitter Card data -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@blinkey">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${icon}">
  <!-- Open Graph data -->
  <meta property="og:title" content="${title}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${domain}/donate/${base64}" />
  <meta property="og:image" content="${icon}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:site_name" content="${title}" />
  <link rel="stylesheet" href="/static/donate.css">
  <script>
    function post() {
      const url = document.getElementById('url').value;
      const twitterPostUrl = "https://x.com/intent/tweet?text=" + encodeURIComponent(url);
      window.open(twitterPostUrl, '_blank');
    }
  </script>
</head>
<body>
  <div class="donate">
    <div class="url">
      <div class="input-group">
        <input type="text" value="${domain}/donate/${base64}" id="url" readonly>
        <button onclick="javascript:post()" class="post">Post to X</button>
      </div>
    </div>
    <div class="preview">
      <img id="preview-icon" src="${icon}" alt="Icon Preview">
      <h2 id="preview-title" class="title">${title}</h2>
      <p class="description" id="preview-description">${description}</p>
      <div class="amounts" id="preview-amounts">
        <!-- Amount buttons will be inserted here -->
        ${amount_options.map((amount) => html`<button class="amount" data-amount="${amount}">${amount} SOL</button>`)}
      </div>
      <div class="input-group" id="custom-amount">
        <input type="text" placeholder="Enter custom amount">
        <button id="preview-label" class="label">${label}</button>
      </div>
    </div>
    <div class="create">
      <a href="/">Create your donate blink</a>
    </div>
  </div>
</body>
</html>`
  )
  return renderHtml;
};
