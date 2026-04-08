import Button from "@/components/common/button";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  return (
    <SafeAreaView className="flex-1 bg-zinc-50 px-5 pt-6">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View className="mb-5">
          <Text className="text-zinc-900 text-3xl font-space-bold leading-9">Hồ sơ</Text>
          <Text className="mt-1 text-sm font-inter text-zinc-500">Quản lý thông tin tài khoản của bạn</Text>
        </View>

        <View className="rounded-3xl border border-zinc-200 bg-white p-5">
          <View className="flex-row items-center">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#0047AB]">
              <Text className="text-xl font-space-bold text-white">A</Text>
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-xl font-space-bold text-zinc-900" numberOfLines={1}>
                Trần Nguyên Anh
              </Text>
              <Text className="mt-1 text-sm font-inter text-zinc-500" numberOfLines={1}>
                user@gmail.com
              </Text>
            </View>

            <View className="rounded-full bg-blue-50 px-3 py-1">
              <Text className="text-xs font-inter text-blue-700 tracking-wide">USER</Text>
            </View>
          </View>

          <View className="mt-5 h-px bg-zinc-100" />

          <View className="mt-4 gap-3">
            <View className="flex-row items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
              <Text className="text-sm font-inter text-zinc-600">Vai trò</Text>
              <Text className="text-sm font-space-bold text-zinc-900">USER</Text>
            </View>

            <View className="flex-row items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
              <Text className="text-sm font-inter text-zinc-600">Email</Text>
              <Text className="text-sm font-space-bold text-zinc-900">user@gmail.com</Text>
            </View>
            <View className="flex-row items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
              <Text className="text-sm font-inter text-zinc-600">Phone</Text>
              <Text className="text-sm font-space-bold text-zinc-900">0913239054</Text>
            </View>
          </View>

          <View className="mt-5">
            <Button title="Cập nhật" variant="primary" onPress={() => { }} />
          </View>
        </View>

        <View className="mt-20">
          <Button title="Đăng xuất" icon="log-out-outline" variant="outline" onPress={() => {}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;