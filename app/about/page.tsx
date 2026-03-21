export default function AboutPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(24,24,24,0.9) 0%, #0a0a0a 42%, #050505 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "40px 14px 72px",
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
            marginBottom: "34px",
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
              fontSize: "clamp(34px, 6vw, 72px)",
              lineHeight: "1.02",
              fontWeight: 400,
              letterSpacing: "-1.2px",
              margin: "0 0 18px 0",
            }}
          >
            A structured intelligence layer for real estate demand
          </h1>

          <p
            style={{
              margin: 0,
              color: "#cfcfcf",
              fontSize: "clamp(16px, 2vw, 19px)",
              lineHeight: "1.85",
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
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "18px",
            marginBottom: "22px",
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
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "18px",
          }}
        >
          <div style={largeCard}>
            <h2 style={sectionTitle}>How the platform works</h2>

            <div style={flowBlock}>
              <div style={flowStep}>01</div>
              <div style={{ minWidth: 0 }}>
                <div style={flowTitle}>A user starts a request</div>
                <div style={flowText}>
                  Buyers, sellers, tenants, landlords and investors submit a
                  guided request through a short structured flow.
                </div>
              </div>
            </div>

            <div style={flowBlock}>
              <div style={flowStep}>02</div>
              <div style={{ minWidth: 0 }}>
                <div style={flowTitle}>The request is normalized</div>
                <div style={flowText}>
                  The platform organizes the submission into a usable lead
                  profile: geography, intent, property type, urgency and budget.
                </div>
              </div>
            </div>

            <div style={flowBlock}>
              <div style={flowStep}>03</div>
              <div style={{ minWidth: 0 }}>
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

            <div style={reasonsList}>
              <ReasonItem text="Better lead quality" />
              <ReasonItem text="Less noise for agencies" />
              <ReasonItem text="Cleaner territory logic" />
              <ReasonItem text="More scalable routing" />
              <ReasonItem text="Stronger fit for pay-per-lead" />
            </div>
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
        padding: "24px",
        minWidth: 0,
      }}
    >
      <h3
        style={{
          margin: "0 0 12px 0",
          fontSize: "clamp(22px, 3vw, 28px)",
          lineHeight: "1.12",
          fontWeight: 400,
          letterSpacing: "-0.5px",
          color: "white",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#cfcfcf",
          lineHeight: "1.8",
          fontSize: "15px",
        }}
      >
        {text}
      </p>
    </div>
  );
}

function ReasonItem({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "999px",
          backgroundColor: "#d8d8d8",
          marginTop: "9px",
          flexShrink: 0,
        }}
      />

      <div
        style={{
          color: "#d0d0d0",
          fontSize: "16px",
          lineHeight: "1.8",
        }}
      >
        {text}
      </div>
    </div>
  );
}

const largeCard: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(15,15,15,1) 0%, rgba(10,10,10,1) 100%)",
  border: "1px solid #1d1d1d",
  borderRadius: "22px",
  padding: "24px",
  minWidth: 0,
};

const sideCard: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(15,15,15,1) 0%, rgba(10,10,10,1) 100%)",
  border: "1px solid #1d1d1d",
  borderRadius: "22px",
  padding: "24px",
  minWidth: 0,
};

const sectionTitle: React.CSSProperties = {
  margin: "0 0 18px 0",
  fontSize: "clamp(26px, 4vw, 32px)",
  fontWeight: 400,
  letterSpacing: "-0.8px",
  lineHeight: "1.1",
};

const flowBlock: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "56px minmax(0, 1fr)",
  gap: "16px",
  alignItems: "start",
  padding: "18px 0",
  borderTop: "1px solid #1d1d1d",
};

const flowStep: React.CSSProperties = {
  width: "48px",
  height: "48px",
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
  fontSize: "clamp(20px, 3vw, 24px)",
  fontWeight: 500,
  marginBottom: "8px",
  color: "white",
  lineHeight: "1.2",
};

const flowText: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.8",
  color: "#cfcfcf",
};

const reasonsList: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};