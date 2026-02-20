import { useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Track({ profile }) {
  const [params] = useSearchParams();
  const tab = params.get("tab") || "stools";

  if (!profile) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Track</h2>
        <p>
          No profile loaded yet. Go to <b>Profile</b> and login / create profile.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 24,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 900 }}>
        <h2 style={{ marginTop: 0 }}>Track</h2>

        {tab === "consumptions" && <ConsumptionsUI profile={profile} />}
        {tab === "stools" && <StoolsUI profile={profile} />}
        {tab === "feelings" && <FeelingsUI profile={profile} />}

        {tab === "history" && <Placeholder title="Historique (next)" />}
        {tab === "export" && <Placeholder title="Export (next)" />}
      </div>
    </div>
  );
}

function Placeholder({ title }) {
  return (
    <div style={{ padding: 16, border: "1px dashed #999", borderRadius: 12 }}>
      {title}
    </div>
  );
}

/* ------------------ CONSUMPTIONS UI (saved to DB) ------------------ */

function ConsumptionsUI({ profile }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const nowTime = useMemo(() => new Date().toTimeString().slice(0, 5), []);

  const [date, setDate] = useState(today);
  const [time, setTime] = useState(nowTime);

  const [type, setType] = useState("repas"); // repas | boisson | supplement | medicament
  const [prepMode, setPrepMode] = useState("");
  const [consumptionText, setConsumptionText] = useState("");
  const [afterEffects, setAfterEffects] = useState("");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const showPrep = type === "repas" || type === "boisson";

  const title = useMemo(() => {
    if (type === "repas") return "Aliments consommés";
    if (type === "boisson") return "Boisson consommée";
    if (type === "supplement") return "Complément pris";
    return "Médicament pris";
  }, [type]);

  const buttonLabel = useMemo(() => {
    if (type === "repas") return "Enregistrer le repas";
    if (type === "boisson") return "Enregistrer la boisson";
    if (type === "supplement") return "Enregistrer le complément";
    return "Enregistrer le médicament";
  }, [type]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!consumptionText.trim()) {
      setMsg("❌ Remplis le champ principal.");
      return;
    }

    setSaving(true);
    const payload = {
      profile_id: profile.id,
      consumption_date: date,
      consumption_time: time,
      consumption_type: type,
      prep_mode: showPrep ? (prepMode || null) : null,
      consumption: consumptionText.trim(),
      after_effects: afterEffects.trim() || null,
    };

    const { data, error } = await supabase
      .from("consumptions")
      .insert([payload])
      .select()
      .single();

    setSaving(false);

    if (error) {
      setMsg("❌ Insert error: " + error.message);
      return;
    }

    setMsg("✅ Saved! id: " + data.id);
    setConsumptionText("");
    setAfterEffects("");
    setPrepMode("");
  };

  return (
    <div style={{ ...card, background: "#fff" }}>
      <div style={{ display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Date">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={input} />
          </Field>

          <Field label="Heure">
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={input} />
          </Field>
        </div>

        <div>
          <div style={sectionTitle}>Type de consommation</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <TypeBtn active={type === "repas"} onClick={() => setType("repas")}>🍽️ Repas</TypeBtn>
            <TypeBtn active={type === "boisson"} onClick={() => setType("boisson")}>☕ Boisson</TypeBtn>
            <TypeBtn active={type === "supplement"} onClick={() => setType("supplement")}>💊 Complément</TypeBtn>
            <TypeBtn active={type === "medicament"} onClick={() => setType("medicament")}>💉 Médicament</TypeBtn>
          </div>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
          {showPrep && (
            <div>
              <div style={sectionTitle}>Mode de préparation</div>
              <select
                value={prepMode}
                onChange={(e) => setPrepMode(e.target.value)}
                style={{ ...input, appearance: "auto" }}
              >
                <option value="">Sélectionner...</option>
                <option value="homemade">Fait maison</option>
                <option value="restaurant">Restaurant</option>
                <option value="industrial">Industriel</option>
                <option value="fried">Frit</option>
                <option value="spicy">Épicé</option>
                <option value="raw">Cru</option>
              </select>
            </div>
          )}

          <div>
            <div style={sectionTitle}>{title}</div>
            <textarea
              value={consumptionText}
              onChange={(e) => setConsumptionText(e.target.value)}
              placeholder="Ex : riz, légumes, poisson"
              rows={4}
              style={{ ...input, height: 110, resize: "none" }}
            />
          </div>

          <div>
            <div style={sectionTitle}>Ressenti après la consommation</div>
            <textarea
              value={afterEffects}
              onChange={(e) => setAfterEffects(e.target.value)}
              placeholder="Ex : ballonnements, douleurs"
              rows={4}
              style={{ ...input, height: 110, resize: "none" }}
            />
          </div>

          <button type="submit" style={primaryBtn} disabled={saving}>
            {saving ? "Saving..." : buttonLabel}
          </button>

          {msg && <div style={msgStyle}>{msg}</div>}
        </form>
      </div>
    </div>
  );
}

/* ------------------ STOOLS UI (saved to DB) ------------------ */

function StoolsUI({ profile }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const nowTime = useMemo(() => new Date().toTimeString().slice(0, 5), []);

  const [stoolDate, setStoolDate] = useState(today);
  const [stoolTime, setStoolTime] = useState(nowTime);
  const [consistency, setConsistency] = useState(4);
  const [painLevel, setPainLevel] = useState(0);
  const [urgency, setUrgency] = useState(0);
  const [bloodLevel, setBloodLevel] = useState("none");
  const [mucusLevel, setMucusLevel] = useState("none");
  const [stoolColor, setStoolColor] = useState("brown");
  const [evacuationEffort, setEvacuationEffort] = useState("normal");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    setSaving(true);

    const payload = {
      profile_id: profile.id,
      stool_date: stoolDate,
      stool_time: stoolTime,
      consistency: Number(consistency),
      pain_level: Number(painLevel),
      urgency: Number(urgency),
      blood_level: bloodLevel,
      mucus_level: mucusLevel,
      stool_color: stoolColor,
      evacuation_effort: evacuationEffort,
      notes: notes.trim() || null,
    };

    const { data, error } = await supabase.from("stools").insert([payload]).select().single();

    setSaving(false);

    if (error) {
      setMsg("❌ Insert error: " + error.message);
      return;
    }

    setMsg("✅ Saved! id: " + data.id);
    setNotes("");
  };

  return (
    <div style={{ ...card, background: "#fff" }}>
      <h3 style={{ marginTop: 0 }}>Selles (Ajouter)</h3>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <Field label="Date">
          <input type="date" value={stoolDate} onChange={(e) => setStoolDate(e.target.value)} style={input} />
        </Field>

        <Field label="Heure">
          <input type="time" value={stoolTime} onChange={(e) => setStoolTime(e.target.value)} style={input} />
        </Field>

        <Field label="Consistance (1-7)">
          <input type="number" min="1" max="7" value={consistency} onChange={(e) => setConsistency(e.target.value)} style={input} />
        </Field>

        <Field label="Douleur (0-10)">
          <input type="number" min="0" max="10" value={painLevel} onChange={(e) => setPainLevel(e.target.value)} style={input} />
        </Field>

        <Field label="Urgence (0-10)">
          <input type="number" min="0" max="10" value={urgency} onChange={(e) => setUrgency(e.target.value)} style={input} />
        </Field>

        <Field label="Sang">
          <select value={bloodLevel} onChange={(e) => setBloodLevel(e.target.value)} style={{ ...input, appearance: "auto" }}>
            <option value="none">None</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </Field>

        <Field label="Mucus">
          <select value={mucusLevel} onChange={(e) => setMucusLevel(e.target.value)} style={{ ...input, appearance: "auto" }}>
            <option value="none">None</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </Field>

        <Field label="Couleur">
          <select value={stoolColor} onChange={(e) => setStoolColor(e.target.value)} style={{ ...input, appearance: "auto" }}>
            <option value="brown">Brown</option>
            <option value="yellow">Yellow</option>
            <option value="green">Green</option>
            <option value="black">Black</option>
            <option value="red">Red</option>
          </select>
        </Field>

        <Field label="Effort d’évacuation">
          <select value={evacuationEffort} onChange={(e) => setEvacuationEffort(e.target.value)} style={{ ...input, appearance: "auto" }}>
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
        </Field>

        <Field label="Notes">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ ...input, height: 90, resize: "none" }} />
        </Field>

        <button type="submit" style={primaryBtn} disabled={saving}>
          {saving ? "Saving..." : "Enregistrer"}
        </button>

        {msg && <div style={msgStyle}>{msg}</div>}
      </form>
    </div>
  );
}

/* ------------------ FEELINGS UI (saved to DB) ------------------ */

function FeelingsUI({ profile }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const nowTime = useMemo(() => new Date().toTimeString().slice(0, 5), []);

  const [date, setDate] = useState(today);
  const [time, setTime] = useState(nowTime);
  const [globalFeeling, setGlobalFeeling] = useState("ok");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    setSaving(true);

    const payload = {
      profile_id: profile.id,
      global_feeling: globalFeeling,
      capture_date: date,
      capture_time: time,
      notes: notes.trim() || null,
    };

    const { data, error } = await supabase
      .from("feeling_captures")
      .insert([payload])
      .select()
      .single();

    setSaving(false);

    if (error) {
      setMsg("❌ Insert error: " + error.message);
      return;
    }

    setMsg("✅ Saved! id: " + data.id);
    setNotes("");
  };

  return (
    <div style={{ ...card, background: "#fff" }}>
      <h3 style={{ marginTop: 0 }}>Ressenti (Ajouter)</h3>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <Field label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={input} />
        </Field>

        <Field label="Heure">
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={input} />
        </Field>

        <Field label="Ressenti global">
          <select value={globalFeeling} onChange={(e) => setGlobalFeeling(e.target.value)} style={{ ...input, appearance: "auto" }}>
            <option value="great">Très bien</option>
            <option value="ok">Ok</option>
            <option value="bad">Mal</option>
            <option value="pain">Douleur</option>
            <option value="bloating">Ballonnements</option>
            <option value="nausea">Nausée</option>
          </select>
        </Field>

        <Field label="Notes">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} style={{ ...input, height: 110, resize: "none" }} />
        </Field>

        <button type="submit" style={primaryBtn} disabled={saving}>
          {saving ? "Saving..." : "Enregistrer"}
        </button>

        {msg && <div style={msgStyle}>{msg}</div>}
      </form>
    </div>
  );
}

/* ------------------ SHARED UI ------------------ */

function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span style={{ fontSize: 18, fontWeight: 700, color: "#2f3f23" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function TypeBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "16px 14px",
        borderRadius: 16,
        border: active ? "2px solid #2f3f23" : "2px solid #d6b98e",
        background: active ? "#2f3f23" : "#fff",
        color: active ? "#fff" : "#2f3f23",
        fontSize: 18,
        fontWeight: 700,
        cursor: "pointer",
        textAlign: "center",
      }}
    >
      {children}
    </button>
  );
}

/* Styles */
const card = {
  maxWidth: 720,
  borderRadius: 24,
  padding: 22,
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  border: "1px solid rgba(0,0,0,0.06)",
  background: "#fff",
};

const sectionTitle = {
  fontSize: 20,
  fontWeight: 800,
  color: "#2f3f23",
  marginBottom: 10,
};

const input = {
  width: "100%",
  padding: "16px 14px",
  borderRadius: 16,
  border: "2px solid #d6b98e",
  fontSize: 20,
  outline: "none",
};

const primaryBtn = {
  width: "100%",
  marginTop: 6,
  padding: "16px 14px",
  borderRadius: 16,
  border: "none",
  background: "#b06f46",
  color: "white",
  fontSize: 22,
  fontWeight: 900,
  cursor: "pointer",
};

const msgStyle = {
  fontWeight: 800,
  color: "#2f3f23",
};