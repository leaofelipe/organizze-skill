# organizze-skill

![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

Scripts Node.js para interagir com a [API do Organizze](https://github.com/organizze/api-doc). Cada recurso tem seu proprio script executavel direto no terminal.

## Requisitos

- Node.js >= 18.0.0
- Conta no [Organizze](https://app.organizze.com.br) com token de acesso

## Instalacao

```bash
git clone <repo>
cd organizze-skill
npm install
```

## Configuracao

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
ORGANIZZE_EMAIL=seu@email.com
ORGANIZZE_TOKEN=seu_token_de_acesso
ORGANIZZE_USER_AGENT=organizze-skill (seu@email.com)
```

O token de acesso esta disponivel em [app.organizze.com.br/configuracoes/api-keys](https://app.organizze.com.br/configuracoes/api-keys).

## Uso

### Contas bancarias

```bash
node src/routes/accounts.js list
node src/routes/accounts.js get <id>
node src/routes/accounts.js create '{"name":"Itau CC","type":"checking"}'
node src/routes/accounts.js update <id> '{"name":"Itau Poupanca"}'
node src/routes/accounts.js delete <id>
```

### Categorias

```bash
node src/routes/categories.js list
node src/routes/categories.js get <id>
node src/routes/categories.js create '{"name":"Alimentacao"}'
node src/routes/categories.js update <id> '{"name":"Mercado"}'
node src/routes/categories.js delete <id>
node src/routes/categories.js delete <id> '{"replacement_id":5}'
```

### Movimentacoes

```bash
node src/routes/transactions.js list
node src/routes/transactions.js list --start-date=2026-04-01 --end-date=2026-04-30
node src/routes/transactions.js list --account-id=<id>
node src/routes/transactions.js get <id>
node src/routes/transactions.js create '{"description":"Mercado","amount_cents":-5000,"date":"2026-04-03","paid":true}'
node src/routes/transactions.js update <id> '{"description":"Mercado atualizado"}'
node src/routes/transactions.js delete <id>
node src/routes/transactions.js delete <id> '{"update_future":true}'
```

### Cartoes de credito

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

### Transferencias

```bash
node src/routes/transfers.js list
node src/routes/transfers.js list --start-date=2026-04-01 --end-date=2026-04-30
node src/routes/transfers.js get <id>
node src/routes/transfers.js create '{"credit_account_id":3,"debit_account_id":4,"amount_cents":10000,"date":"2026-04-03","paid":true}'
node src/routes/transfers.js update <id> '{"description":"Transferencia ajustada"}'
node src/routes/transfers.js delete <id>
```

## Estrutura

```
src/
├── client.js          # HTTP client (auth, headers, error handling)
└── routes/
    ├── accounts.js
    ├── categories.js
    ├── transactions.js
    ├── credit-cards.js
    └── transfers.js
```

Cada modulo em `src/routes/` pode ser usado de duas formas:

- **CLI** -- executado diretamente com `node src/routes/<resource>.js <action> [args]`
- **Modulo** -- importado em outros scripts via `import { listAccounts } from './src/routes/accounts.js'`

O output e sempre JSON no stdout. Erros vao para stderr com exit code 1.
