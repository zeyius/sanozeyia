import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  return (
    <div style={{ padding: 24, background: "#efe3d2", minHeight: "100vh" }}>
      <div
        style={{
          background: "#d9c4a5",
          padding: 24,
          borderRadius: 20,
          marginBottom: 24,
        }}
      >
        <h2 style={{ margin: 0 }}>RÉCAPITULATIF DU JOUR</h2>

        <div style={{ marginTop: 20, display: "grid", gap: 16 }}>
          <MetricRow label="Consommations" value={0} onClick={() => nav("/track?tab=consumptions")} />
          <MetricRow label="Ressenti" value={0} onClick={() => nav("/track?tab=feelings")} />
          <MetricRow label="Selles" value={0} onClick={() => nav("/track?tab=stools")} />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
      >
        <Card label="Consommations" onClick={() => nav("/track?tab=consumptions")} />
        <Card label="Selles" highlight onClick={() => nav("/track?tab=stools")} />
        <Card label="Ressenti" onClick={() => nav("/track?tab=feelings")} />
        <Card label="Historique" onClick={() => nav("/track?tab=history")} />
      </div>

      <button
        onClick={() => nav("/track?tab=export")}
        style={{
          width: "100%",
          marginTop: 32,
          background: "#2f3f23",
          color: "white",
          padding: 18,
          borderRadius: 16,
          border: "none",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Exporter pour le praticien
      </button>
    </div>
  );
}

function MetricRow({ label, value, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        justifyContent: "space-between",
        cursor: "pointer",
        padding: "10px 8px",
        borderRadius: 12,
      }}
    >
      <span>{label}</span>
      <span>{value} →</span>
    </div>
  );
}

function Card({ label, highlight, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: highlight ? "#a9a37f" : "#f5f5f5",
        padding: 30,
        borderRadius: 20,
        textAlign: "center",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <h3 style={{ margin: 0 }}>{label}</h3>
    </div>
  );
}
