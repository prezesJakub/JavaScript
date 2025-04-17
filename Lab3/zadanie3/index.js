import React from "https://esm.sh/react?dev";
import ReactDOMClient from "https://esm.sh/react-dom/client?dev";
import App from "./App.js";

const root = ReactDOMClient.createRoot(document.getElementById("root"));
root.render(<App />);