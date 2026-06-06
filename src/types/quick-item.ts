import type { Ionicons } from "@expo/vector-icons";
import type React from "react";

export type QuickItem = {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  bg: string;
  desc?: string;
  onPress: () => void;
};

