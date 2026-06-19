import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>Bus Tracker</h1>
      <p>Your application will be here.</p>
    </div>
  );
}

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element not found");
}
createRoot(rootEl).render(<App />);
