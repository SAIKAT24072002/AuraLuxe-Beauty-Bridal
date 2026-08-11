import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { SiteContentProvider } from "./context/SiteContentContext";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SiteContentProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SiteContentProvider>
  </React.StrictMode>
);
