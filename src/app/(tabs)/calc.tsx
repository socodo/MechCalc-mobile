import { QuickItem } from "@/types/quick-item";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Calc = () => {



  const quickItems: QuickItem[] = [
    {
      title: "Động cơ điện",
      icon: "settings-outline",
      color: "#2F80ED",
      bg: "#EAF2FF",
      desc: "Công suất, mô-men xoắn, tốc độ quay",
      onPress: () => router.push("/(tabs)/calc"),
    },
    {
      title: "Bộ truyền xích",
      icon: "link-outline",
      color: "#22C55E",
      bg: "#E9FBEF",
      desc: "bước xích, số mắt, khoảng cách trục",
      onPress: () => router.push("/(tabs)/calc"),
    },
    {
      title: "Bánh răng",
      icon: "reader-outline",
      color: "#F97316",
      bg: "#FFF2E8",
      desc: "Modun, số răng, đường kính",

      onPress: () => router.push("/(tabs)/calc"),
    }
  ];

  return (
    <SafeAreaView className="flex-1 px-10 py-10">
      <ScrollView >
        <View>
          <Text className="uppercase text-neutral-500 text-lg mb-1 font-normal font-space leading-4 tracking-wide">module</Text>
          <Text className="text-neutral-600 text-3xl font-space-bold mb-7 leading-8">Tính Toán</Text>
        </View>

        <View>
          {quickItems.map((item, index) => (
            <TouchableOpacity className="flex-row items-center gap-4 p-5 border rounded-xl mb-5" key={index}>
              <View style={{ backgroundColor: item.bg, height: 40, width: 40, alignItems: "center", justifyContent: "center" }} ><Ionicons size={20} color={item.color} name={item.icon}></Ionicons></View>
              <View>
                <Text className="text-neutral-600 text-lg font-medium font-inter leading-5">{item.title}</Text>
                <Text className="text-neutral-500 text-sm font-inter leading-4">{item.desc}</Text>
              </View>

            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>

  );
};

export default Calc;