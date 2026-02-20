import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Track from "./pages/Track";
import Profile from "./pages/Profile";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("Idle");

  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error(error);
      setStatus(`Profile load error: ${error.message}`);
      return;
    }

    setProfile(data || null);
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session;
      setSession(currentSession);

      if (currentSession?.user) {
        await loadProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);

        if (newSession?.user) {
          await loadProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async () => {
    setStatus("Logging in...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus(`Login error: ${error.message}`);
      return;
    }

    setStatus("Login success ✅");
    setSession(data.session);

    // ✅ important: load profile immediately after login
    if (data.session?.user) {
      await loadProfile(data.session.user.id);
    }
  };

  const handleLogout = async () => {
    setStatus("Logging out...");
    const { error } = await supabase.auth.signOut();

    if (error) {
      setStatus(`Logout error: ${error.message}`);
      return;
    }

    setStatus("Logged out ✅");
    setSession(null);
    setProfile(null);
  };

  const createProfileIfMissing = async () => {
    setStatus("Checking profile...");
    const user = session?.user;
    if (!user) {
      setStatus("No session. Login first.");
      return;
    }

    const { data: existing, error: selectErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (selectErr) {
      setStatus(`Profile check error: ${selectErr.message}`);
      return;
    }

    if (existing) {
      setProfile(existing);
      setStatus("Profile already exists ✅");
      return;
    }

    const { data: created, error: insertErr } = await supabase
      .from("profiles")
      .insert([{ user_id: user.id, name: "My Profile" }])
      .select()
      .single();

    if (insertErr) {
      setStatus(`Create profile error: ${insertErr.message}`);
      return;
    }

    setProfile(created);
    setStatus("Profile created ✅");
  };

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <nav
        style={{
          padding: 16,
          borderBottom: "1px solid #ddd",
          display: "flex",
          gap: 16,
        }}
      >
        <Link to="/">Home</Link>
        <Link to="/track">Track</Link>
        <Link to="/profile">Profile</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/track" element={<Track profile={profile} />} />
        <Route
          path="/profile"
          element={
            <Profile
              session={session}
              email={email}
              password={password}
              setEmail={setEmail}
              setPassword={setPassword}
              handleLogin={handleLogin}
              handleLogout={handleLogout}
              createProfileIfMissing={createProfileIfMissing}
              profile={profile}
              status={status}
            />
          }
        />
      </Routes>
    </div>
  );
}