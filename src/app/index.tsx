import { Redirect } from "expo-router";

import { ROUTES } from "@/constants/routes";
import { useAuthSession } from "@/providers/auth-session-provider";

export default function IndexScreen() {
  const { user } = useAuthSession();

  return <Redirect href={user ? ROUTES.home : ROUTES.welcome} />;
}
