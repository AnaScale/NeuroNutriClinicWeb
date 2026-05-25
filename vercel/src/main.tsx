import { createRoot } from "react-dom/client";
import { Site } from "./components/mockups/nnc-site/Site";
import "./index.css";

createRoot(document.getElementById("root")!).render(<Site />);
