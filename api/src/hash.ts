import { keccak256, toUtf8Bytes } from 'ethers';

// MVP: keccak256 over concatenated canonical JSON lines.
// For production, replace with a proper Merkle tree to support inclusion proofs.
export function batchHash(items: any[]): `0x${string}` {
  const lines = items.map(i => JSON.stringify(i));
  const payload = lines.join('\n');
  return keccak256(toUtf8Bytes(payload));
}
