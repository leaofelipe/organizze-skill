---
name: organizze
description: Read and write Organizze personal finance data using MCP tools available in Claude Desktop. Use this skill whenever the user wants to check balances, list transactions, create expenses, manage credit cards, transfers, categories, or any other personal finance operation in Organizze. Trigger for queries like "quanto gastei", "lança uma despesa", "qual meu saldo", "extrato do mês", "fatura do cartão", or any mention of Organizze, transactions, accounts, or personal finance data.
---

# Organizze (Claude Desktop via MCP)

Use the MCP tools exposed by the Organizze MCP server to read and write personal finance data.

## Setup (one-time)

The MCP server must be configured in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "organizze": {
      "command": "node",
      "args": ["/path/to/organizze-skill/src/index.js"],
      "env": {
        "ORGANIZZE_EMAIL": "seu@email.com",
        "ORGANIZZE_TOKEN": "seu-token",
        "ORGANIZZE_USER_AGENT": "claude-desktop"
      }
    }
  }
}
```

If tools are unavailable, ask the user to check the MCP server config and restart Claude Desktop.

## Key conventions

- **`amount_cents`**: always integers in cents. R$ 50,00 = `5000`. Expenses = negative value.
- **Dates**: `YYYY-MM-DD`
- **Tags**: array of `{ "name": "tag_name" }` objects

## Available MCP tools

### Accounts

| Tool             | Purpose                         |
| ---------------- | ------------------------------- |
| `list_accounts`  | List all accounts with balances |
| `get_account`    | Get a single account by id      |
| `create_account` | Create account                  |
| `update_account` | Update account                  |
| `delete_account` | Delete account                  |

### Transactions

| Tool                 | Purpose                                                                             |
| -------------------- | ----------------------------------------------------------------------------------- |
| `list_transactions`  | List transactions (supports `start_date`, `end_date`, `account_id`, `group_by_tag`) |
| `get_transaction`    | Get a single transaction                                                            |
| `create_transaction` | Create expense, income, installment, or recurring                                   |
| `update_transaction` | Update transaction (use `update_future: true` or `update_all: true` for recurring)  |
| `delete_transaction` | Delete transaction (same options for recurring)                                     |

### Categories

| Tool              | Purpose                                                 |
| ----------------- | ------------------------------------------------------- |
| `list_categories` | List all categories                                     |
| `get_category`    | Get a single category                                   |
| `create_category` | Create category                                         |
| `update_category` | Update category                                         |
| `delete_category` | Delete (accepts `replacement_id` to migrate references) |

### Credit Cards

| Tool                               | Purpose                                          |
| ---------------------------------- | ------------------------------------------------ |
| `list_credit_cards`                | List cards                                       |
| `get_credit_card`                  | Get a single card                                |
| `create_credit_card`               | Create card                                      |
| `update_credit_card`               | Update card                                      |
| `delete_credit_card`               | Delete card                                      |
| `list_credit_card_invoices`        | List invoices for a card (optional `start_date`) |
| `get_credit_card_invoice`          | Get a specific invoice                           |
| `get_credit_card_invoice_payments` | Get payments for an invoice                      |

### Transfers

| Tool              | Purpose                                                     |
| ----------------- | ----------------------------------------------------------- |
| `list_transfers`  | List transfers (returns debit + credit as separate objects) |
| `get_transfer`    | Get a single transfer                                       |
| `create_transfer` | Create transfer between accounts                            |
| `update_transfer` | Update transfer                                             |
| `delete_transfer` | Delete transfer                                             |

## Common workflows

### Check balances

Call `list_accounts`. Present account names and `current_balance_cents / 100` formatted as BRL.

### Transactions for a period

1. `list_accounts` or `list_categories` to resolve ids if needed
2. `list_transactions` with `start_date` and `end_date`

### Create a simple expense

```json
{
  "description": "Almoço",
  "amount_cents": -3500,
  "date": "2025-04-18",
  "account_id": 123,
  "category_id": 456
}
```

### Create installment expense (parcelamento)

```json
{
  "description": "Notebook",
  "amount_cents": -10000,
  "date": "2025-04-01",
  "account_id": 123,
  "category_id": 456,
  "installments_attributes": { "periodicity": "monthly", "total": 12 }
}
```

Periodicity values: `monthly`, `yearly`, `weekly`, `biweekly`, `bimonthly`, `trimonthly`

### Create fixed recurring transaction

```json
{
  "description": "Aluguel",
  "amount_cents": -200000,
  "date": "2025-04-05",
  "account_id": 123,
  "category_id": 789,
  "recurrence_attributes": { "periodicity": "monthly" }
}
```

### Spending by tag

`list_transactions` with `start_date`, `end_date`, and `group_by_tag: true`. Returns `[{ tag, total_cents, transactions[] }]`.

### Transfer between accounts

```json
{
  "credit_account_id": 1,
  "debit_account_id": 2,
  "amount_cents": 50000,
  "date": "2025-04-18",
  "paid": true
}
```

## Output guidelines

- Format currency as **R$ X.XXX,XX** (Brazilian format)
- Mask sensitive data (full account numbers, tokens) in summaries
- For list responses, prefer compact tables over raw JSON
- When resolving names to IDs (e.g. "conta Nubank"), call the list tool first, match by name, then proceed
