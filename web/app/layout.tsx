export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui', margin: 0, padding: 24, background: '#f7f7f7' }}>
        <h1>Levain Lineage</h1>
        {children}
      </body>
    </html>
  );
}
