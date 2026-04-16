import 'react-native-gesture-handler';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StatusBar} from 'expo-status-bar';
import {View, Text, StyleSheet} from 'react-native';

import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import FieldOverviewScreen from './src/screens/FieldOverviewScreen';
import IrrigationScreen from './src/screens/IrrigationScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import TraceabilityScreen from './src/screens/TraceabilityScreen';
import CommunityScreen from './src/screens/CommunityScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({icon, label, focused}) {
  return (
    <View style={styles.tabIconWrap}>
      <Text style={[styles.tabIconText, focused && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
      {focused && <View style={styles.tabDot} />}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="FieldMap"
        component={FieldOverviewScreen}
        options={{tabBarIcon: ({focused}) => <TabIcon icon="🗺️" label="Field" focused={focused} />}}
      />
      <Tab.Screen
        name="Planner"
        component={IrrigationScreen}
        options={{tabBarIcon: ({focused}) => <TabIcon icon="💧" label="Irrigate" focused={focused} />}}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{tabBarIcon: ({focused}) => <TabIcon icon="📊" label="Analytics" focused={focused} />}}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{tabBarIcon: ({focused}) => <TabIcon icon="💬" label="Community" focused={focused} />}}
      />
      <Tab.Screen
        name="Trace"
        component={TraceabilityScreen}
        options={{tabBarIcon: ({focused}) => <TabIcon icon="🔗" label="Trace" focused={focused} />}}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: ({current, layouts}) => ({
            cardStyle: {
              opacity: current.progress,
              transform: [{
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width * 0.25, 0],
                }),
              }],
            },
          }),
        }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0d1f12',
    borderTopColor: '#1a3a22',
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 4,
    paddingTop: 4,
  },
  tabIconWrap: {alignItems: 'center', paddingTop: 4},
  tabIconText: {fontSize: 22, opacity: 0.45},
  tabIconActive: {opacity: 1},
  tabLabel: {fontSize: 9, color: '#475569', marginTop: 2, fontWeight: '600'},
  tabLabelActive: {color: '#22C55E', fontWeight: '700'},
  tabDot: {width: 4, height: 4, borderRadius: 2, backgroundColor: '#22C55E', marginTop: 2},
});
