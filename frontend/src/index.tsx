import React from "react";
import ReactDOM from "react-dom/client";
import App from "./routes/index"; // Ensure this points to the correct file
import "./index.css"; // Ensure global styles are loaded

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
