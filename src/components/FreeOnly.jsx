import { useSubscription } from "../services/SubscriptionContext";

export default function FreeOnly({ children }) {
  const { isPremium, subLoading } = useSubscription();
  if (subLoading) return null;
  if (isPremium) return null;
  return children;
}
