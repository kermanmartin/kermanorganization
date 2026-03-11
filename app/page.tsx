export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: "Arial",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>
        THE KERMAN ORGANIZATION
      </h1>

      <p style={{ fontSize: "22px", maxWidth: "700px", lineHeight: "1.5" }}>
        AI-powered real estate intelligence.
        <br />
        We help buyers, sellers and investors make better property decisions.
      </p>

      <button
        style={{
          marginTop: "40px",
          padding: "15px 35px",
          fontSize: "18px",
          borderRadius: "8px",
          border: "none",
          background: "#ffffff",
          color: "#000000",
          cursor: "pointer",
        }}
      >
        Contact Us
      </button>
    </main>
  );
}