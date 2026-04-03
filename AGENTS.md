# Agent Instructions

## What this project does

Node.js scripts to read and write data from the Organizze personal finance API. Each script in `src/routes/` maps to one API resource and outputs JSON to stdout.

## Setup check

Before running any script, verify `.env` exists with:
- `ORGANIZZE_EMAIL`
- `ORGANIZZE_TOKEN`
- `ORGANIZZE_USER_AGENT`

If missing, instruct the user to copy `.env.example` and fill in their credentials.

## Running scripts

```bash
node src/routes/<resource>.js <action> [args]
```

Available resources: `accounts`, `categories`, `transactions`, `credit-cards`, `transfers`

Common actions: `list`, `get <id>`, `create <json>`, `update <id> <json>`, `delete <id>`

Run any script without arguments to see its full usage.

## Key conventions

- `amount_cents` is always in cents (integer). R$ 50,00 = `5000`, expense = negative value.
- Dates use `YYYY-MM-DD` format.
- Transactions support `--start-date=`, `--end-date=`, `--account-id=` flags on `list`.
- Deleting a recurring/installment transaction accepts `{"update_future":true}` or `{"update_all":true}` as the last argument.
- Credit card invoices are under `credit-cards.js` using `list-invoices`, `get-invoice`, and `get-payments` actions.

## Commits

Follow conventional commits format:

```
type(scope): description
```

Examples: `feat(transactions): add list by account`, `fix(client): handle empty response body`, `docs(readme): update usage examples`

## API reference

Full API docs: https://github.com/organizze/api-doc
