import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ManageMenu } from "./components/ManageMenu";

const isManage = /^\/manage\/?$/.test(window.location.pathname);

createRoot(document.getElementById("root")!).render(
  <StrictMode>{isManage ? <ManageMenu /> : <App />}</StrictMode>,
);
