import { getAuth, onAuthStateChanged, type FirebaseAuthTypes } from "@react-native-firebase/auth";
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

import { APP_STRINGS } from "@/constants/strings";

type AuthSession = {
  isLoading: boolean;
  user: FirebaseAuthTypes.User | null;
};

const AuthSessionContext = createContext<AuthSession | null>(null);

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(() => ({ isLoading, user }), [isLoading, user]);

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const session = useContext(AuthSessionContext);

  if (!session) {
    throw new Error(APP_STRINGS.auth.missingProvider);
  }

  return session;
}
