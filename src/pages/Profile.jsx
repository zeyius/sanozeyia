export default function Profile({
  session,
  email,
  password,
  setEmail,
  setPassword,
  handleLogin,
  handleLogout,
  createProfileIfMissing,
  loadMyProfile,
  profile,
  status,
}) {
  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h2>Profile</h2>

      <div style={{ marginBottom: 16 }}>
        <strong>Status:</strong> {status}
      </div>

      {!session ? (
        <>
          <h3>Login</h3>

          <div style={{ display: "grid", gap: 8, maxWidth: 360 }}>
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: 10 }}
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: 10 }}
            />
            <button onClick={handleLogin}>Login</button>
          </div>
        </>
      ) : (
        <>
          <p>
            Logged in as: <strong>{session.user.email}</strong>
          </p>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={createProfileIfMissing}>
              Create Profile If Missing
            </button>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <div style={{ marginTop: 16 }}>
            <h3>My Profile</h3>
            <pre>{JSON.stringify(profile, null, 2)}</pre>
          </div>
        </>
      )}
    </div>
  );
}

