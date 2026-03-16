export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "2rem",
        textAlign: "center"
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
        Freeform Next.js Frame
      </h1>
      <p style={{ maxWidth: 480, color: "#555", lineHeight: 1.5 }}>
        You now have a very minimal Next.js + React setup. Start editing{" "}
        <code>app/page.tsx</code> to build your app.
      </p>
    </main>
  );
}

