# Organizze MCP and CLI

![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

[MCP](https://modelcontextprotocol.io) server and CLI scripts for the [Organizze API](https://github.com/organizze/api-doc).

## Requirements

- Node.js >= 18.0.0
- An [Organizze](https://app.organizze.com.br) account with an API token

## Configuration

Set these environment variables (MCP client `env` block, shell, or `.env`):

```env
ORGANIZZE_EMAIL=your@email.com
ORGANIZZE_TOKEN=your_access_token
ORGANIZZE_USER_AGENT=organizze-mcp (your@email.com)
```

For local CLI only, you can use:

```bash
cp .env.example .env
```

Token: [app.organizze.com.br/configuracoes/api-keys](https://app.organizze.com.br/configuracoes/api-keys).

## Claude Desktop (MCP)

1. `npm install` in this repository.
2. Edit `~/Library/Application Support/Claude/claude_desktop_config.json` and add:

```json
{
  "mcpServers": {
    "organizze": {
      "command": "node",
      "args": ["/absolute/path/to/organizze-skill/src/server.js"],
      "env": {
        "ORGANIZZE_EMAIL": "your@email.com",
        "ORGANIZZE_TOKEN": "your-api-token",
        "ORGANIZZE_USER_AGENT": "organizze-mcp"
      }
    }
  }
}
```

3. Restart Claude Desktop.

Run the server manually: `npm run mcp` (with env vars set).

Global install is optional: `npm link` from the repo root registers the `organizze-mcp` bin.

## LLM guidance

[`SKILL.md`](SKILL.md) documents conventions, MCP tool names, CLI equivalents, and workflows (amounts in cents, dates, tag grouping, transfers semantics).

## CLI usage

### Accounts

```bash
node src/routes/accounts.js list
node src/routes/accounts.js get <id>
node src/routes/accounts.js create '{"name":"Itau CC","type":"checking"}'
node src/routes/accounts.js update <id> '{"name":"Itau Savings"}'
node src/routes/accounts.js delete <id>
```

### Categories

```bash
node src/routes/categories.js list
node src/routes/categories.js get <id>
node src/routes/categories.js create '{"name":"Groceries"}'
node src/routes/categories.js update <id> '{"name":"Supermarket"}'
node src/routes/categories.js delete <id>
node src/routes/categories.js delete <id> '{"replacement_id":5}'
```

### Transactions

```bash
node src/routes/transactions.js list
node src/routes/transactions.js list --start-date=2026-04-01 --end-date=2026-04-30
node src/routes/transactions.js list --account-id=<id>
node src/routes/transactions.js get <id>
node src/routes/transactions.js create '{"description":"Supermarket","amount_cents":-5000,"date":"2026-04-03","paid":true}'
node src/routes/transactions.js update <id> '{"description":"Updated description"}'
node src/routes/transactions.js delete <id>
node src/routes/transactions.js delete <id> '{"update_future":true}'
node src/routes/transactions.js list --group-by-tag
node src/routes/transactions.js list --start-date=2026-04-01 --end-date=2026-04-30 --group-by-tag
```

### Credit cards

```bash
node src/routes/credit-cards.js list
node src/routes/credit-cards.js get <id>
node src/routes/credit-cards.js create '{"name":"Nubank","due_day":10,"closing_day":3,"limit_cents":500000}'
node src/routes/credit-cards.js update <id> '{"name":"Nubank Black"}'
node src/routes/credit-cards.js delete <id>
node src/routes/credit-cards.js list-invoices <credit_card_id>
node src/routes/credit-cards.js list-invoices <credit_card_id> --start-date=2026-01-01 --end-date=2026-12-31
node src/routes/credit-cards.js get-invoice <credit_card_id> <invoice_id>
node src/routes/credit-cards.js get-payments <credit_card_id> <invoice_id>
```

### Transfers

> `list` returns both sides of each transfer as separate transaction objects (debit and credit).

```bash
node src/routes/transfers.js list
node src/routes/transfers.js list --start-date=2026-04-01 --end-date=2026-04-30
node src/routes/transfers.js get <id>
node src/routes/transfers.js create '{"credit_account_id":3,"debit_account_id":4,"amount_cents":10000,"date":"2026-04-03","paid":true}'
node src/routes/transfers.js update <id> '{"description":"Adjusted transfer"}'
node src/routes/transfers.js delete <id>
```

## Structure

```
src/
├── server.js        # MCP server (stdio)
├── client.js        # HTTP client (auth, headers, errors)
├── credentials.js   # env / optional .env load
└── routes/
    ├── accounts.js
    ├── categories.js
    ├── transactions.js
    ├── credit-cards.js
    └── transfers.js
```

Each module in `src/routes/` supports CLI when run directly and can be imported from `src/server.js`.

CLI: JSON on stdout; errors on stderr, exit code 1.
