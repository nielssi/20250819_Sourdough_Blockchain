import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { contract, wallet } from './eth.js';
import { getClient, putJSON } from './ipfs.js';
import { batchHash } from './hash.js';

const PORT = Number(process.env.PORT || 8787);
const WEB3_TOKEN = process.env.WEB3STORAGE_TOKEN || '';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

const client = getClient(WEB3_TOKEN);

// Health
app.get('/health', async () => ({ ok: true }));

// Mint genesis
app.post('/v1/starters', async (req, rep) => {
  const schema = z.object({
    displayName: z.string(),
    ownerAddress: z.string().optional(),
    metadata: z.record(z.any()).optional()
  });
  const body = schema.parse(req.body);

  const meta = {
    starterId: "pending",
    displayName: body.displayName,
    bornAt: new Date().toISOString(),
    photos: [],
    bio: body.metadata?.bio || null
  };
  const cid = await putJSON(client, `starter_meta_${nanoid(6)}.json`, meta);
  const uri = `ipfs://${cid}`;

  const to = body.ownerAddress || wallet.address;
  const tx = await contract.mintGenesis(to, uri);
  const rc = await tx.wait();
  // Find token id from event (or query totalSupply)
  const events = rc?.logs || [];
  // Ethers v6 logs parsing is more involved; as a simplification, ask contract for total
  const total = await contract.totalSupply();
  const tokenId = Number(total);

  return rep.send({ tokenId, uri, txHash: tx.hash });
});

// Split (fork)
app.post('/v1/starters/:id/split', async (req, rep) => {
  const params = z.object({ id: z.string() }).parse(req.params);
  const schema = z.object({
    displayName: z.string(),
    ownerAddress: z.string().optional(),
    metadata: z.record(z.any()).optional()
  });
  const body = schema.parse(req.body);

  const meta = {
    starterId: "pending",
    displayName: body.displayName,
    bornAt: new Date().toISOString(),
    photos: [],
    bio: body.metadata?.bio || null
  };
  const cid = await putJSON(client, `starter_meta_${nanoid(6)}.json`, meta);
  const uri = `ipfs://${cid}`;

  const to = body.ownerAddress || wallet.address;
  const tx = await contract.mintSplit(params.id, to, uri);
  const rc = await tx.wait();
  const total = await contract.totalSupply();
  const childId = Number(total);

  return rep.send({ childId, uri, txHash: tx.hash });
});

// Merge
app.post('/v1/starters/merge', async (req, rep) => {
  const schema = z.object({
    parentIds: z.array(z.number()).min(2),
    displayName: z.string(),
    ownerAddress: z.string().optional(),
    metadata: z.record(z.any()).optional()
  });
  const body = schema.parse(req.body);

  const meta = {
    starterId: "pending",
    displayName: body.displayName,
    bornAt: new Date().toISOString(),
    photos: [],
    bio: body.metadata?.bio || null
  };
  const cid = await putJSON(client, `starter_meta_${nanoid(6)}.json`, meta);
  const uri = `ipfs://${cid}`;

  const to = body.ownerAddress || wallet.address;
  const tx = await contract.mintMerge(body.parentIds, to, uri);
  const rc = await tx.wait();
  const total = await contract.totalSupply();
  const childId = Number(total);

  return rep.send({ childId, uri, txHash: tx.hash });
});

// Anchor events/tags/snapshots
app.post('/v1/events/anchor', async (req, rep) => {
  const schema = z.object({
    starterId: z.number(),
    items: z.array(z.record(z.any())).min(1),
    kind: z.enum(['events','tags','snapshot','timecapsule']).default('events')
  });
  const body = schema.parse(req.body);

  const hash = batchHash(body.items);
  const batch = {
    batchId: nanoid(8),
    starterId: body.starterId,
    anchoredAt: new Date().toISOString(),
    items: body.items,
    hash
  };
  const cid = await putJSON(client, `batch_${body.starterId}_${nanoid(4)}.json`, batch);
  const tx = await contract.anchorEvents(body.starterId, hash, body.kind);
  const rc = await tx.wait();

  return rep.send({ cid, hash, txHash: tx.hash });
});

// Basic lineage/meta view
app.get('/v1/lineage/:id', async (req, rep) => {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  const meta = await contract.getMeta(id);
  // Without an indexer, children are not discoverable on-chain; return only parents for now.
  return rep.send({
    id: Number(id),
    bornAt: Number(meta[0]),
    parentIds: meta[1].map((n: any) => Number(n)),
    metadataURI: meta[2]
  });
});

app.listen({ port: PORT, host: '0.0.0.0' }).then(() => {
  console.log(`API listening on :${PORT}`);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
