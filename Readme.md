# Solana Safe Transfer web

A light web app to use the solana-safe-transfer program.

## How to run

- install dependencies

```bash
bun install
```

- Create a .env file

```bash
cp .env.example .env
```

- Update the env var `NEXT_PUBLIC_SOLANA_RPC_URL` with the right value. Notice that you can also leave that pointing to
  devnet since I already have a devenet program deployed under the address that is in the code

- if you want to deploy your own program, make sure to copy the idl file from the anchor repo
  `target/idl/solana_safe_transfer.json` to the `src/programs/solana-safe-transfer` folder under the name `idl.json`.
  And the file `target/types/solana_safe_transfer.ts` to the `src/programs/solana-safe-transfer` folder under the name
  `types.ts` after building the anchor program

- run the app

```bash
bun dev
```
