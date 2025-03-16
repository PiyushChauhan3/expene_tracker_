import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { AuthProvider } from "./AuthContext.jsx";

// Ensure that you have a div with id 'root' in your HTML file, usually in public/index.html
const rootElement = document.getElementById("root");


  createRoot(rootElement).render(
    <AuthProvider>
     
    <StrictMode>
        <App />
    </StrictMode>
   
    </AuthProvider>
  );

