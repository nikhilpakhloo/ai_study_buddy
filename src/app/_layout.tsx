import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { COLORS } from "@/constants/theme";
import {
  AuthSessionProvider,
  useAuthSession,
} from "@/providers/auth-session-provider";

function RootNavigator() {
  const { isLoading, user } = useAuthSession();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: COLORS.background },
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(user)}>
        <Stack.Screen name="(main)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthSessionProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthSessionProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
});
