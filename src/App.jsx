import { RouterProvider } from "react-router-dom";
import { router } from "./routes/routes";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./services/AuthContext";
import { SubscriptionProvider } from "./services/SubscriptionContext";

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <RouterProvider router={router} />
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;

