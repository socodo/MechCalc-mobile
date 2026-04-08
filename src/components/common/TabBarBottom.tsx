// import React from 'react'
// import { Ionicons } from '@expo/vector-icons'
// import { Pressable, Text, View } from 'react-native'

// interface TabBarItemProps {
//   label: string
//   routeName: string
//   color: string
//   focused: boolean
//   iconName: React.ComponentProps<typeof Ionicons>['name']
//   onPress: () => void
//   onLongPress?: () => void
// }

// const TabBarItem: React.FC<TabBarItemProps> = ({
//   label,
//   routeName,
//   color,
//   focused,
//   iconName,
//   onPress,
//   onLongPress,
// }) => {
//   return (
//     <Pressable
//       accessibilityRole="button"
//       accessibilityState={focused ? { selected: true } : {}}
//       accessibilityLabel={label}
//       onPress={onPress}
//       onLongPress={onLongPress}
//       className="flex-1 items-center justify-center py-2"
//     >
//       <View className="items-center justify-center">
//         <Ionicons name={iconName} size={22} color={focused ? color : '#9BA1A6'} />
//         <Text
//           className={focused ? 'mt-1 text-xs font-semibold' : 'mt-1 text-xs'}
//           style={{ color: focused ? color : '#9BA1A6' }}
//         >
//           {label}
//         </Text>
//       </View>
//     </Pressable>
//   )
// }

// export default TabBarItem