export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        color: "white",
        fontFamily: "Arial",
        padding: "60px 20px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "52px", marginBottom: "20px" }}>
        THE KERMAN ORGANIZATION
      </h1>

      <p style={{ fontSize: "24px", maxWidth: "800px", margin: "0 auto" }}>
        AI-powered real estate intelligence.
        <br />
        We connect serious buyers, sellers and investors with the right opportunities.
      </p>

      <div style={{ marginTop: "60px" }}>
        <h2 style={{ fontSize: "32px", marginBottom: "20px" }}>
          What we do
        </h2>

        <p style={{ maxWidth: "700px", margin: "0 auto", fontSize: "18px" }}>
          Our platform analyzes property demand using artificial intelligence
          and connects qualified real estate clients with the most relevant
          agencies and opportunities.
        </p>
      </div>

      <div style={{ marginTop: "80px" }}>
        <button
          style={{
            padding: "16px 40px",
            fontSize: "18px",
            borderRadius: "8px",
            border: "none",
            background: "white",
            color: "black",
            cursor: "pointer",
          }}
        >
          Start here
        </button>
      </div>
    </main>
  );
}