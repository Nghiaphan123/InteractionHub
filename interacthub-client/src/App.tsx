import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { useAuth } from "./context/AuthContext";

function App() {
  const [count, setCount] = useState(0)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const { login, logout, user, loading, error } = useAuth();

    if (!user) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "transparent"
        }}
      >
        <div
          style={{
            background: "#000",
            padding: "40px",
            borderRadius: "15px",
            width: "320px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}
        >
          <h2 style={{ marginBottom: "30px", color: "#667eea" }}>Login</h2>

          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px",
              marginBottom: "15px",
              borderRadius: "8px",
              background: "#000",
              border: "1px solid #fff",
              color: "#fff"
            }}
          />

          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px",
              marginBottom: "15px",
              borderRadius: "8px",
              background: "#000",
              border: "1px solid #fff",
              color: "#fff"
            }}
          />

          <button
            onClick={() => login(email, password)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background: "#667eea",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Login
          </button>

          {loading && <p style={{ marginTop: "10px" }}>Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>

      <div className="ticks"></div>
      <section id="spacer"></section>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button onClick={logout}>Logout</button>
        {user && <p>Xin chào {user.name}</p>}
      </div>
    </>
  )
}

export default App
