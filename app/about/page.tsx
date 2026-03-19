export default function AboutPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(24,24,24,0.9) 0%, #0a0a0a 42%, #050505 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "56px 16px 84px",
      }}
    >
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            maxWidth: "860px",
            marginBottom: "42px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 12px",
              borderRadius: "999px",
              border: "1px solid #252525",
              backgroundColor: "#121212",
              color: "#b8b8b8",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            About us
          </div>

          <h1
            style={{
              fontSize: "clamp(42px, 6vw, 72px)",
              lineHeight: "0.98",
              fontWeight: 400,
              letterSpacing: "-1.6px",
              margin: "0 0 18px 0",
            }}
          >
            A structured intelligence layer for real estate demand
          </h1>

          <p
            style={{
              margin: 0,
              color: "#cfcfcf",
              fontSize: "19px",
              lineHeight: "1.9",
              maxWidth: "820px",
            }}
          >
            The Kerman Organization is designed to turn fragmented real estate
            demand into structured, qualified opportunities that can be routed
            more intelligently.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "22px",
            marginBottom: "42px",
          }}
        >
          <SectionCard
            title="Structured intake"
            text="Instead of relying on vague contact forms, the platform captures location, property profile, timing, financial position and user intent in a structured way."
          />
          <SectionCard
            title="Clearer qualification"
            text="Each submission becomes a cleaner commercial profile. That makes routing decisions more consistent and gives agencies more relevant information from the start."
          />
          <SectionCard
            title="Selective agency visibility"
            text="Approved agencies do not see every request. They only see opportunities that align with their territory, client profile, property focus and working range."
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "22px",
          }}
        >
          <div style={largeCard}>
            <h2 style={sectionTitle}>How the platform works</h2>

            <div style={flowBlock}>
              <div style={flowStep}>01</div>
              <div>
                <div style={flowTitle}>A user starts a request</div>
                <div style={flowText}>
                  Buyers, sellers, tenants, landlords and investors submit a
                  guided request through a short structured flow.
                </div>
              </div>
            </div>

            <div style={flowBlock}>
              <div style={flowStep}>02</div>
              <div>
                <div style={flowTitle}>The request is normalized</div>
                <div style={flowText}>
                  The platform organizes the submission into a usable lead
                  profile: geography, intent, property type, urgency and budget.
                </div>
              </div>
            </div>

            <div style={flowBlock}>
              <div style={flowStep}>03</div>
              <div>
                <div style={flowTitle}>Relevant agencies receive visibility</div>
                <div style={flowText}>
                  Agencies only access leads that match their market profile,
                  rather than browsing a generic undifferentiated pool.
                </div>
              </div>
            </div>
          </div>

          <div style={sideCard}>
            <h2 style={sectionTitle}>Why this matters</h2>

            <ul style={listStyle}>
              <li>Better lead quality</li>
              <li>Less noise for agencies</li>
              <li>Cleaner territory logic</li>
              <li>More scalable routing</li>
              <li>Stronger fit for pay-per-lead</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, rgba(15,15,15,1) 0%, rgba(10,10,10,1) 100%)",
        border: "1px solid #1d1d1d",
        borderRadius: "20px",
        padding: "28px",
      }}
    >
      <h3
        style={{
          margin: "0 0 12px 0",
          fontSize: "28px",
          lineHeight: "1.1",
          fontWeight: 400,
          letterSpacing: "-0.6px",
          color: "white",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#cfcfcf",
          lineHeight: "1.85",
          fontSize: "16px",
        }}
      >
        {text}
      </p>
    </div>
  );
}

const largeCard: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(15,15,15,1) 0%, rgba(10,10,10,1) 100%)",
  border: "1px solid #1d1d1d",
  borderRadius: "22px",
  padding: "30px",
};

const sideCard: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(15,15,15,1) 0%, rgba(10,10,10,1) 100%)",
  border: "1px solid #1d1d1d",
  borderRadius: "22px",
  padding: "30px",
};

const sectionTitle: React.CSSProperties = {
  margin: "0 0 18px 0",
  fontSize: "32px",
  fontWeight: 400,
  letterSpacing: "-0.8px",
};

const flowBlock: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "64px 1fr",
  gap: "16px",
  alignItems: "start",
  padding: "18px 0",
  borderTop: "1px solid #1d1d1d",
};

const flowStep: React.CSSProperties = {
  width: "52px",
  height: "52px",
  borderRadius: "999px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#111111",
  border: "1px solid #232323",
  color: "#d8d8d8",
  fontSize: "14px",
  fontWeight: 700,
};

const flowTitle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 500,
  marginBottom: "8px",
  color: "white",
};

const flowText: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.85",
  color: "#cfcfcf",
};

const listStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: "20px",
  color: "#cfcfcf",
  lineHeight: "2",
  fontSize: "17px",
};