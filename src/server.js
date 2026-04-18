#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as z from 'zod/v4';

import './credentials.js';

import {
  listAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
} from './routes/accounts.js';
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from './routes/categories.js';
import {
  listTransactions,
  listTransactionsGrouped,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from './routes/transactions.js';
import {
  listCreditCards,
  getCreditCard,
  createCreditCard,
  updateCreditCard,
  deleteCreditCard,
  listInvoices,
  getInvoice,
  getInvoicePayments,
} from './routes/credit-cards.js';
import {
  listTransfers,
  getTransfer,
  createTransfer,
  updateTransfer,
  deleteTransfer,
} from './routes/transfers.js';

const jsonData = z.record(z.string(), z.unknown()).describe('JSON body matching Organizze API fields');

function textJson(data) {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

const mcpServer = new McpServer({
  name: 'organizze-mcp',
  version: '1.3.4',
});

// --- accounts ---
mcpServer.registerTool(
  'list_accounts',
  { description: 'List all bank accounts from Organizze.' },
  async () => textJson(await listAccounts()),
);

mcpServer.registerTool(
  'get_account',
  {
    description: 'Get one account by id.',
    inputSchema: { id: z.string().describe('Account id') },
  },
  async ({ id }) => textJson(await getAccount(id)),
);

mcpServer.registerTool(
  'create_account',
  {
    description: 'Create a new account. Use amount_cents and API field names per Organizze docs.',
    inputSchema: { data: jsonData },
  },
  async ({ data }) => textJson(await createAccount(data)),
);

mcpServer.registerTool(
  'update_account',
  {
    description: 'Update an existing account.',
    inputSchema: { id: z.string(), data: jsonData },
  },
  async ({ id, data }) => textJson(await updateAccount(id, data)),
);

mcpServer.registerTool(
  'delete_account',
  {
    description: 'Delete an account by id.',
    inputSchema: { id: z.string() },
  },
  async ({ id }) => textJson(await deleteAccount(id)),
);

// --- categories ---
mcpServer.registerTool(
  'list_categories',
  { description: 'List all categories.' },
  async () => textJson(await listCategories()),
);

mcpServer.registerTool(
  'get_category',
  {
    description: 'Get one category by id.',
    inputSchema: { id: z.string() },
  },
  async ({ id }) => textJson(await getCategory(id)),
);

mcpServer.registerTool(
  'create_category',
  { description: 'Create a category.', inputSchema: { data: jsonData } },
  async ({ data }) => textJson(await createCategory(data)),
);

mcpServer.registerTool(
  'update_category',
  {
    description: 'Update a category.',
    inputSchema: { id: z.string(), data: jsonData },
  },
  async ({ id, data }) => textJson(await updateCategory(id, data)),
);

mcpServer.registerTool(
  'delete_category',
  {
    description:
      'Delete a category. Optionally pass options with replacement_id to migrate references.',
    inputSchema: {
      id: z.string(),
      options: jsonData.optional(),
    },
  },
  async ({ id, options }) => textJson(await deleteCategory(id, options)),
);

// --- transactions ---
mcpServer.registerTool(
  'list_transactions',
  {
    description:
      'List transactions. Optional filters: start_date, end_date, account_id (YYYY-MM-DD). Set group_by_tag true for local grouping by tag with total_cents per tag.',
    inputSchema: {
      start_date: z.string().optional(),
      end_date: z.string().optional(),
      account_id: z.string().optional(),
      group_by_tag: z.boolean().optional(),
    },
  },
  async ({ start_date: startDate, end_date: endDate, account_id: accountId, group_by_tag: groupByTag }) => {
    const filters = { startDate, endDate, accountId };
    const data = groupByTag
      ? await listTransactionsGrouped(filters)
      : await listTransactions(filters);
    return textJson(data);
  },
);

mcpServer.registerTool(
  'get_transaction',
  {
    description: 'Get one transaction by id.',
    inputSchema: { id: z.string() },
  },
  async ({ id }) => textJson(await getTransaction(id)),
);

mcpServer.registerTool(
  'create_transaction',
  {
    description:
      'Create a transaction. amount_cents: integer cents; expenses negative. date: YYYY-MM-DD.',
    inputSchema: { data: jsonData },
  },
  async ({ data }) => textJson(await createTransaction(data)),
);

mcpServer.registerTool(
  'update_transaction',
  {
    description: 'Update a transaction.',
    inputSchema: { id: z.string(), data: jsonData },
  },
  async ({ id, data }) => textJson(await updateTransaction(id, data)),
);

mcpServer.registerTool(
  'delete_transaction',
  {
    description:
      'Delete a transaction. For recurring/installment, pass options: { update_future: true } or { update_all: true }.',
    inputSchema: {
      id: z.string(),
      options: jsonData.optional(),
    },
  },
  async ({ id, options }) => textJson(await deleteTransaction(id, options)),
);

// --- credit cards ---
mcpServer.registerTool(
  'list_credit_cards',
  { description: 'List all credit cards.' },
  async () => textJson(await listCreditCards()),
);

mcpServer.registerTool(
  'get_credit_card',
  {
    description: 'Get one credit card by id.',
    inputSchema: { id: z.string() },
  },
  async ({ id }) => textJson(await getCreditCard(id)),
);

mcpServer.registerTool(
  'create_credit_card',
  { description: 'Create a credit card.', inputSchema: { data: jsonData } },
  async ({ data }) => textJson(await createCreditCard(data)),
);

mcpServer.registerTool(
  'update_credit_card',
  {
    description: 'Update a credit card.',
    inputSchema: { id: z.string(), data: jsonData },
  },
  async ({ id, data }) => textJson(await updateCreditCard(id, data)),
);

mcpServer.registerTool(
  'delete_credit_card',
  {
    description: 'Delete a credit card.',
    inputSchema: { id: z.string() },
  },
  async ({ id }) => textJson(await deleteCreditCard(id)),
);

mcpServer.registerTool(
  'list_credit_card_invoices',
  {
    description: 'List invoices for a credit card; optional start_date and end_date (YYYY-MM-DD).',
    inputSchema: {
      credit_card_id: z.string(),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
    },
  },
  async ({ credit_card_id: creditCardId, start_date: startDate, end_date: endDate }) =>
    textJson(await listInvoices(creditCardId, { startDate, endDate })),
);

mcpServer.registerTool(
  'get_credit_card_invoice',
  {
    description: 'Get a single invoice for a credit card.',
    inputSchema: {
      credit_card_id: z.string(),
      invoice_id: z.string(),
    },
  },
  async ({ credit_card_id: creditCardId, invoice_id: invoiceId }) =>
    textJson(await getInvoice(creditCardId, invoiceId)),
);

mcpServer.registerTool(
  'get_credit_card_invoice_payments',
  {
    description: 'List payments for a credit card invoice.',
    inputSchema: {
      credit_card_id: z.string(),
      invoice_id: z.string(),
    },
  },
  async ({ credit_card_id: creditCardId, invoice_id: invoiceId }) =>
    textJson(await getInvoicePayments(creditCardId, invoiceId)),
);

// --- transfers ---
mcpServer.registerTool(
  'list_transfers',
  {
    description:
      'List transfers; optional start_date and end_date. Note: list returns debit and credit sides as separate rows.',
    inputSchema: {
      start_date: z.string().optional(),
      end_date: z.string().optional(),
    },
  },
  async ({ start_date: startDate, end_date: endDate }) =>
    textJson(await listTransfers({ startDate, endDate })),
);

mcpServer.registerTool(
  'get_transfer',
  {
    description: 'Get one transfer by id.',
    inputSchema: { id: z.string() },
  },
  async ({ id }) => textJson(await getTransfer(id)),
);

mcpServer.registerTool(
  'create_transfer',
  {
    description:
      'Create a transfer (e.g. credit_account_id, debit_account_id, amount_cents, date, paid).',
    inputSchema: { data: jsonData },
  },
  async ({ data }) => textJson(await createTransfer(data)),
);

mcpServer.registerTool(
  'update_transfer',
  {
    description: 'Update a transfer.',
    inputSchema: { id: z.string(), data: jsonData },
  },
  async ({ id, data }) => textJson(await updateTransfer(id, data)),
);

mcpServer.registerTool(
  'delete_transfer',
  {
    description: 'Delete a transfer.',
    inputSchema: { id: z.string() },
  },
  async ({ id }) => textJson(await deleteTransfer(id)),
);

const transport = new StdioServerTransport();
await mcpServer.connect(transport);
