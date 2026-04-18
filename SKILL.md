# Organizze API (MCP and CLI)

Use this project to read and write Organizze personal finance data through the official REST API. Prefer **MCP tools** when the client exposes them (e.g. Claude Desktop). The same operations exist as **CLI scripts** for terminals and automation.

## Credentials

Required environment variables (never log or echo their values):

- `ORGANIZZE_EMAIL` — Basic Auth username (Organizze account email)
- `ORGANIZZE_TOKEN` — Basic Auth password (API token from Organizze settings)
- `ORGANIZZE_USER_AGENT` — Short string identifying the integration (required by the API)

If any are missing, stop and tell the user to configure them (Claude Desktop MCP `env` block, shell exports, or `.env` from `.env.example`).

Mask PII when summarizing API responses.

## MCP tool names (quick map)

| Area | MCP tools |
|------|-----------|
| Accounts | `list_accounts`, `get_account`, `create_account`, `update_account`, `delete_account` |
| Categories | `list_categories`, `get_category`, `create_category`, `update_category`, `delete_category` |
| Transactions | `list_transactions`, `get_transaction`, `create_transaction`, `update_transaction`, `delete_transaction` |
| Credit cards | `list_credit_cards`, `get_credit_card`, `create_credit_card`, `update_credit_card`, `delete_credit_card`, `list_credit_card_invoices`, `get_credit_card_invoice`, `get_credit_card_invoice_payments` |
| Transfers | `list_transfers`, `get_transfer`, `create_transfer`, `update_transfer`, `delete_transfer` |

`list_transactions` accepts optional `start_date`, `end_date`, `account_id`, and `group_by_tag` (boolean). When `group_by_tag` is true, results are grouped locally by tag (not a native Organizze API feature).

## Key conventions

- **`amount_cents`:** always in cents (integer). R$ 50,00 = `5000`; expense = negative value.
- **Dates:** `YYYY-MM-DD` format.
- **Transactions — list filters:** CLI `list` supports `--start-date=`, `--end-date=`, `--account-id=`. MCP `list_transactions` uses `start_date`, `end_date`, `account_id` (same meaning).
- **Transactions — group by tag:** CLI `--group-by-tag` on `list`; MCP `group_by_tag: true` on `list_transactions`. **Local grouping** after the API response (not a native API feature). Returns `[{ tag, total_cents, transactions[] }]`. Transactions with multiple tags appear in each group; untagged ones go into `"untagged"`.
- **Transactions — delete recurring/installment:** optional `{"update_future":true}` or `{"update_all":true}` (CLI: last JSON argument; MCP: `options` on `delete_transaction`).
- **Credit card invoices:** in [`src/routes/credit-cards.js`](src/routes/credit-cards.js) as `list-invoices`, `get-invoice`, `get-payments`. MCP: `list_credit_card_invoices`, `get_credit_card_invoice`, `get_credit_card_invoice_payments`.
- **`transfers list` / `list_transfers`:** returns both sides of each transfer as separate transaction objects (debit and credit), not a single transfer object.

For field names and payloads not listed here, see: https://github.com/organizze/api-doc

---

## accounts

| Action | CLI | MCP tool |
|--------|-----|----------|
| list | `node src/routes/accounts.js list` | `list_accounts` |
| get | `node src/routes/accounts.js get <id>` | `get_account` |
| create | `node src/routes/accounts.js create '<json>'` | `create_account` |
| update | `node src/routes/accounts.js update <id> '<json>'` | `update_account` |
| delete | `node src/routes/accounts.js delete <id>` | `delete_account` |

---

## categories

| Action | CLI | MCP tool |
|--------|-----|----------|
| list | `node src/routes/categories.js list` | `list_categories` |
| get | `node src/routes/categories.js get <id>` | `get_category` |
| create | `node src/routes/categories.js create '<json>'` | `create_category` |
| update | `node src/routes/categories.js update <id> '<json>'` | `update_category` |
| delete | `node src/routes/categories.js delete <id> [json]` | `delete_category` with optional `options` |

`delete` accepts optional JSON with `replacement_id` to migrate existing references before removal.

---

## transactions

| Action | CLI | MCP tool |
|--------|-----|----------|
| list | `node src/routes/transactions.js list` + optional flags | `list_transactions` |
| get | `node src/routes/transactions.js get <id>` | `get_transaction` |
| create | `node src/routes/transactions.js create '<json>'` | `create_transaction` |
| update | `node src/routes/transactions.js update <id> '<json>'` | `update_transaction` |
| delete | `node src/routes/transactions.js delete <id> [json]` | `delete_transaction` with optional `options` |

CLI list flags: `--start-date=`, `--end-date=`, `--account-id=`, `--group-by-tag`. MCP: `start_date`, `end_date`, `account_id`, `group_by_tag`.

`delete` accepts optional JSON for recurring/installment behavior: `{"update_future":true}` or `{"update_all":true}`.

---

## credit-cards

| Action | CLI | MCP tool |
|--------|-----|----------|
| list | `node src/routes/credit-cards.js list` | `list_credit_cards` |
| get | `node src/routes/credit-cards.js get <id>` | `get_credit_card` |
| create | `node src/routes/credit-cards.js create '<json>'` | `create_credit_card` |
| update | `node src/routes/credit-cards.js update <id> '<json>'` | `update_credit_card` |
| delete | `node src/routes/credit-cards.js delete <id>` | `delete_credit_card` |
| list-invoices | `node src/routes/credit-cards.js list-invoices <cc_id> [--start-date=...]` | `list_credit_card_invoices` |
| get-invoice | `node src/routes/credit-cards.js get-invoice <cc_id> <invoice_id>` | `get_credit_card_invoice` |
| get-payments | `node src/routes/credit-cards.js get-payments <cc_id> <invoice_id>` | `get_credit_card_invoice_payments` |

---

## transfers

| Action | CLI | MCP tool |
|--------|-----|----------|
| list | `node src/routes/transfers.js list` + optional date flags | `list_transfers` |
| get | `node src/routes/transfers.js get <id>` | `get_transfer` |
| create | `node src/routes/transfers.js create '<json>'` | `create_transfer` |
| update | `node src/routes/transfers.js update <id> '<json>'` | `update_transfer` |
| delete | `node src/routes/transfers.js delete <id>` | `delete_transfer` |

Typical `create` fields: `credit_account_id`, `debit_account_id`, `amount_cents`, `date`, `paid`. Confirm exact shape via the API doc or by inspecting existing transfers.

---

## End-to-end workflows

### Balances

- MCP: `list_accounts`
- CLI: `node src/routes/accounts.js list`

### Transactions for a period, filtered by account

1. `list_accounts` (or categories) to resolve ids.
2. `list_transactions` with `start_date`, `end_date`, `account_id`.

### Create an expense

`create_transaction` with `data` including negative `amount_cents`, `description`, `date`, `category_id`, `account_id` as required by the API.

### Spending by tag

`list_transactions` with `start_date`, `end_date`, and `group_by_tag: true`. Each group has `tag` and `total_cents`.
