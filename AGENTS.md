# Agent Instructions

## What this project does

- **MCP server** ([`src/server.js`](src/server.js)): stdio transport for Claude Desktop (and other MCP clients). Exposes Organizze API operations as tools; responses are JSON in tool result text.
- **CLI** ([`src/routes/*.js`](src/routes/)): same operations via `node src/routes/<resource>.js <action> [args]`; JSON on stdout.

Shared HTTP layer: [`src/client.js`](src/client.js). Auth and env loading: [`src/credentials.js`](src/credentials.js).

## Credentials

Required: `ORGANIZZE_EMAIL`, `ORGANIZZE_TOKEN`, `ORGANIZZE_USER_AGENT`.

- **MCP:** set `env` on the server entry in `claude_desktop_config.json` (or your client’s equivalent).
- **CLI / dev:** `.env` from [`.env.example`](.env.example) is loaded automatically when the file exists at the repo root.

If missing, tell the user to configure credentials before calling the API.

## Running the MCP server locally

```bash
npm install
ORGANIZZE_EMAIL=... ORGANIZZE_TOKEN=... ORGANIZZE_USER_AGENT=... npm run mcp
```

Or: `node src/server.js` (same). Do not write logs to **stdout** (stdio is the MCP wire). Use **stderr** only if you must log.

### Claude Desktop (macOS)

Add under `mcpServers` in `~/Library/Application Support/Claude/claude_desktop_config.json` (adjust paths and use your Node binary if needed):

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

Restart Claude Desktop after changing the config.

## Key conventions

These rules apply to **both** MCP tools and CLI scripts (see [`SKILL.md`](SKILL.md) for tool names, tables, and workflows).

- `amount_cents` is always in cents (integer). R$ 50,00 = `5000`, expense = negative value.
- Dates use `YYYY-MM-DD` format.
- **Transactions — list filters:** CLI uses `--start-date=`, `--end-date=`, `--account-id=` on `list`. MCP `list_transactions` uses `start_date`, `end_date`, `account_id` (same semantics).
- **Transactions — group by tag:** CLI: `--group-by-tag` on `list`. MCP: `group_by_tag: true` on `list_transactions`. This is **local grouping** after the API response, not a native Organizze API feature. Returns `[{ tag, total_cents, transactions[] }]`. Transactions with multiple tags appear in each matching group; untagged ones go into `"untagged"`.
- **Transactions — installments (parcelamento):** include `installments_attributes: { periodicity, total }` in `create_transaction` data. Periodicity values: `monthly`, `yearly`, `weekly`, `biweekly`, `bimonthly`, `trimonthly`. Creates all N installments at once; each has `total_installments` and `installment` (1-based index).
- **Transactions — fixed recurring:** include `recurrence_attributes: { periodicity }` in `create_transaction` data. Same periodicity values.
- **Transactions — tags:** include `tags` as `[{"name": "tag_name"}]` in create/update body. Tags appear in responses and power the `group_by_tag` aggregation.
- **Transactions — update recurring/installment:** include `update_future: true` in data to update this and future occurrences, or `update_all: true` for all (may change balance if past ones are paid).
- **Transactions — delete recurring/installment:** optional body `{"update_future":true}` or `{"update_all":true}` (CLI: last JSON argument; MCP: `options` on `delete_transaction`).
- **Credit card invoices:** exposed as `list-invoices`, `get-invoice`, and `get-payments` in [`src/routes/credit-cards.js`](src/routes/credit-cards.js). MCP equivalents: `list_credit_card_invoices`, `get_credit_card_invoice`, `get_credit_card_invoice_payments`.
- **`transfers` list:** returns both sides of each transfer as separate transaction objects (debit and credit), not a single transfer object. Same for MCP `list_transfers`.

## Development

- Node **>= 18** (ESM, native `fetch`).
- New API surface: add a function in the right `src/routes/*.js`, wire it in [`src/server.js`](src/server.js) with `registerTool` + Zod `inputSchema`, and document in [`SKILL.md`](SKILL.md).
- Keep tool descriptions accurate; they drive LLM tool choice.

## Commits

Conventional commits: `type(scope): description`  
Examples: `feat(mcp): add budgets tool`, `fix(client): handle empty body`

## API reference

https://github.com/organizze/api-doc
