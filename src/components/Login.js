import React, { useState } from "react";

import supabase from "../supabaseClient";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log(supabase.auth);
    console.log(email);
    const { user, session, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert(error.message);
    } else {
      // User is signed in
      alert("Login successful!");
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    const { user, session, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://stumpwimple.github.io/entities-frontend/",
      },
    });

    if (error) {
      alert(error.message);
    } else {
      // User is signed in
      alert("Login successful!");
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
      <button onClick={handleGoogleLogin} disabled={loading}>
        {loading ? "Loading..." : "Login with Google"}
      </button>
    </div>
  );
};

export default Login;
