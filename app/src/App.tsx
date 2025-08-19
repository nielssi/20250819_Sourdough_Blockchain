import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [apiBase, setApiBase] = useState('http://localhost:8787');
  const [displayName, setDisplayName] = useState('My Starter');
  const [result, setResult] = useState<any>(null);

  const createGenesis = async () => {
    const res = await fetch(`${apiBase}/v1/starters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName })
    });
    const json = await res.json();
    setResult(json);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Levain (MVP)</Text>
      <Text>API base</Text>
      <TextInput value={apiBase} onChangeText={setApiBase} style={{ borderWidth: 1, padding: 8 }} />
      <Text>Genesis display name</Text>
      <TextInput value={displayName} onChangeText={setDisplayName} style={{ borderWidth: 1, padding: 8 }} />
      <Button title="Create Genesis Starter" onPress={createGenesis} />
      {result && (<Text selectable>{JSON.stringify(result, null, 2)}</Text>)}
      <StatusBar style="auto" />
    </ScrollView>
  );
}
