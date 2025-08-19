import { Web3Storage, File } from 'web3.storage';

export function getClient(token: string) {
  return new Web3Storage({ token });
}

export async function putJSON(client: Web3Storage, name: string, obj: any) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const files = [new File([blob], name, { type: 'application/json' })];
  const cid = await client.put(files);
  return cid;
}
