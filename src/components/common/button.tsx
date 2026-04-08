import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  variant?: "primary" | "danger" | "outline";
  disabled?: boolean;
};

export default function Button({ title, onPress, icon, variant = "primary", disabled }: Props) {
  const base = "h-12 flex-row items-center justify-center rounded-2xl px-4";
  const variants: Record<NonNullable<Props["variant"]>, string> = {
    primary: "bg-[#0047AB]",
    danger: "bg-red-600",
    outline: "border border-zinc-200 bg-white",
  };

  const textVariants: Record<NonNullable<Props["variant"]>, string> = {
    primary: "text-white",
    danger: "text-white",
    outline: "text-zinc-900",
  };

  const iconColors: Record<NonNullable<Props["variant"]>, string> = {
    primary: "#ffffff",
    danger: "#ffffff",
    outline: "#111827",
  };

  return (
    <Pressable
      className={[base, variants[variant], disabled ? "opacity-50" : "active:opacity-80"].join(" ")}
      onPress={onPress}
      disabled={disabled}
    >
      <View className="flex-row items-center justify-center gap-2">
        {icon ? <Ionicons name={icon} size={18} color={iconColors[variant]} /> : null}
        <Text className={["text-base font-space-bold", textVariants[variant]].join(" ")}>{title}</Text>
      </View>
    </Pressable>
  );
}

