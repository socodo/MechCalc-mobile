// import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
// import React from 'react'
// import { View } from 'react-native'
// import TabBarItem from './TabBarBottom'

// function iconForRoute(routeName: string, focused: boolean) {
//   switch (routeName) {
//     case 'index':
//       return focused ? 'home' : 'home-outline'
//     case 'calc':
//       return focused ? 'calculator' : 'calculator-outline'
//     case 'project':
//       return focused ? 'folder' : 'folder-outline'
//     case 'profile':
//       return focused ? 'person' : 'person-outline'
//     default:
//       return focused ? 'ellipse' : 'ellipse-outline'
//   }
// }

// const Tabbar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
//   return (
//     <View className="flex-row border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
//       {state.routes.map((route, index) => {
//         const isFocused = state.index === index
//         const { options } = descriptors[route.key]
//         const label =
//           typeof options.tabBarLabel === 'string'
//             ? options.tabBarLabel
//             : typeof options.title === 'string'
//               ? options.title
//               : route.name

//         const onPress = () => {
//           const event = navigation.emit({
//             type: 'tabPress',
//             target: route.key,
//             canPreventDefault: true,
//           })

//           if (!isFocused && !event.defaultPrevented) {
//             navigation.navigate(route.name)
//           }
//         }

//         const onLongPress = () => {
//           navigation.emit({
//             type: 'tabLongPress',
//             target: route.key,
//           })
//         }

//         return (
//           <TabBarItem
//             key={route.key}
//             label={String(label)}
//             color="#8D3BB7"
//             routeName={route.name}
//             focused={isFocused}
//             iconName={iconForRoute(route.name, isFocused)}
//             onPress={onPress}
//             onLongPress={onLongPress}
//           />
//         )
//       })}
//     </View>
//   )
// }

// export default Tabbar 