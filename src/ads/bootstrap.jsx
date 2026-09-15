import ReactDOM from "react-dom/client";
import AdRevenueController from "./AdRevenueController";

const mount = document.getElementById("eder-ad-runtime");

if (mount && !mount.dataset.mounted) {
  mount.dataset.mounted = "true";
  ReactDOM.createRoot(mount).render(<AdRevenueController />);
}
