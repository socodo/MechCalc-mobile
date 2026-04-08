import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

const layoutTab = () => {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#8D3BB7",
        tabBarInactiveTintColor: "#9BA1A6",
        tabBarIcon: ({ color, focused, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>["name"] = "ellipse";
          switch (route.name) {
            case "index":
              iconName = focused ? "home" : "home-outline";
              break;
            case "calc":
              iconName = focused ? "calculator" : "calculator-outline";
              break;
            case "project":
              iconName = focused ? "folder" : "folder-outline";
              break;
            case "profile":
              iconName = focused ? "person" : "person-outline";
              break;
          }
          return <Ionicons name={iconName} size={size ?? 22} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Trang Chủ" }} />
      <Tabs.Screen name="calc" options={{ title: "Tính Toán" }} />
      <Tabs.Screen name="project" options={{ title: "Dự Án" }} />
      <Tabs.Screen name="profile" options={{ title: "Hồ Sơ" }} />
    </Tabs>)
}

export default layoutTab;