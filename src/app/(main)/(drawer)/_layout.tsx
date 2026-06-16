import { Drawer } from "expo-router/drawer";

import { AppDrawerContent } from "@/components/AppDrawerContent";
import { APP_STRINGS } from "@/constants/strings";
import { COLORS } from "@/constants/theme";

export default function Layout() {
  return (
    <Drawer
      drawerContent={() => <AppDrawerContent />}
      screenOptions={{
        drawerStyle: { backgroundColor: COLORS.surface, width: 350 },
        headerStyle: { backgroundColor: COLORS.background },
        headerShadowVisible: false,
        headerTintColor: COLORS.textPrimary,
        headerTitleAlign: "center",
      }}
    >
      <Drawer.Screen
        name="home"
        options={{
          drawerLabel: APP_STRINGS.drawer.home,
          title: APP_STRINGS.drawer.appName,
        }}
      />
    </Drawer>
  );
}
