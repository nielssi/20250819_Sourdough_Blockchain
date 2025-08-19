'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [apiBase, setApiBase] = useState<string>('');
  useEffect(() => setApiBase(process.env.NEXT_PUBLIC_API_BASE || ''), []);

  return (
    <div>
      <p>Enter a Starter ID to view lineage meta.</p>
      <LineageForm apiBase={apiBase} />
    </div>
  );
}

function LineageForm({ apiBase }: { apiBase: string }) {
  const [id, setId] = useState('1');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const onFetch = async () => {
    setLoading(true);
    const res = await fetch(`${apiBase}/v1/lineage/${id}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
      <input value={id} onChange={e => setId(e.target.value)} placeholder="Starter ID" />
      <button onClick={onFetch} disabled={!apiBase || loading}>
        {loading ? 'Loading…' : 'Fetch lineage'}
      </button>
      {data && (
        <pre style={{ background: 'white', padding: 16, borderRadius: 8 }}>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}
