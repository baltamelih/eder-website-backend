import { useNavigate } from "react-router-dom";

export function useNavigation() {
  const navigate = useNavigate();

  const goTo = {
    home: () => navigate("/"),
    login: () => navigate("/login"),
    register: () => navigate("/register"),
    pricing: () => navigate("/pricing"),
    dashboard: () => navigate("/app/dashboard"),
    valuation: () => navigate("/app/valuation"),
    settings: () => navigate("/app/settings"),
    account: () => navigate("/app/account"),
  };

  return { navigate, goTo };
}