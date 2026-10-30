import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Calendar, GraduationCap, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Fonts, FontSizes } from '../../src/constants/theme';

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const bottomInset = Math.max(insets.bottom, 8);
  const tabHeight = 60 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomInset,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, focused }) => (
            <Calendar
              size={22}
              color={color}
              strokeWidth={focused ? 2.4 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="grades"
        options={{
          title: 'Grades',
          tabBarIcon: ({ color, focused }) => (
            <GraduationCap
              size={22}
              color={color}
              strokeWidth={focused ? 2.4 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User
              size={22}
              color={color}
              strokeWidth={focused ? 2.4 : 1.8}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  tabItem: {
    paddingVertical: 2,
  },
});
