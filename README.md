# Sourdough Blockchain (Proto)

Monorepo with:
- `contracts/` — Solidity ERC-721 registry for starters (DAG-friendly metadata).
- `api/` — Fastify API for minting, anchoring event batches to IPFS + chain.
- `web/` — Next.js lineage viewer.
- `app/` — Expo React Native (skeleton).

## Quick start

### Prereqs
- Node 20+, pnpm or npm, and git
- A Base Sepolia RPC (Alchemy/Infura/etc.)
- A funded deployer private key (Base Sepolia ETH)
- Web3.Storage token (or Pinata)

### 1) Install deps
```bash
pnpm -v || npm -v
pnpm install # or: npm install --workspaces
```

### 2) Deploy contracts (Base Sepolia)
```bash
cp contracts/.env.example contracts/.env
# edit RPC_URL + PRIVATE_KEY
pnpm --filter contracts hardhat compile
pnpm --filter contracts hardhat run scripts/deploy.ts --network baseSepolia
# copy printed contract address to API + WEB envs
```

### 3) Start API
```bash
cp api/.env.example api/.env
# fill CONTRACT_ADDRESS, RPC_URL, PRIVATE_KEY, WEB3STORAGE_TOKEN
pnpm --filter api dev
```

### 4) Start Web
```bash
cp web/.env.example web/.env.local
# set NEXT_PUBLIC_API_BASE (e.g., http://localhost:8787)
pnpm --filter web dev
```

### 5) (Optional) Start Expo app
```bash
pnpm --filter app start
```

## Notes
- MVP anchoring uses keccak256 of concatenated canonical JSON lines (simple, cheap). Swap for a Merkle root later.
- Lineage DAG endpoint returns basic parent links; you can extend with a Postgres indexer for children & merges.
