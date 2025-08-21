import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { StudioProvider } from "./contexts/StudioContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <StudioProvider>
        <App />
      </StudioProvider>
    </AuthProvider>
  </React.StrictMode>,
);
