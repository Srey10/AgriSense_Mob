import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebase';

import LandingScreen       from './src/screens/LandingScreen';
import LoginScreen         from './src/screens/LoginScreen';
import RegisterScreen      from './src/screens/RegisterScreen';
import FieldOverviewScreen from './src/screens/FieldOverviewScreen';
import IrrigationScreen    from './src/screens/IrrigationScreen';
import AnalyticsScreen     from './src/screens/AnalyticsScreen';
import CommunityScreen     from './src/screens/CommunityScreen';
import ShopScreen          from './src/screens/ShopScreen';
import ChatbotScreen       from './src/screens/ChatbotScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function MainDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true, 
        drawerType: 'front',
        drawerStyle: {
          backgroundColor: '#0d2b18',
          width: 240,
          borderRightWidth: 1,
          borderRightColor: '#1a3a22',
        },
        drawerLabelStyle: {
          fontSize: 14,
          fontWeight: '700',
          marginLeft: -10,
        },
        drawerActiveTintColor: '#22C55E',
        drawerInactiveTintColor: '#94a3b8',
        drawerActiveBackgroundColor: '#163a22',
        headerStyle: { backgroundColor: '#0d2b18', height: 70, borderBottomWidth: 1, borderBottomColor: '#1a3a22' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontSize: 13, fontWeight: '800', letterSpacing: 1 },
      }}
    >
      <Drawer.Screen name="Dashboard" component={FieldOverviewScreen} />
      <Drawer.Screen name="Irrigation" component={IrrigationScreen} />
      <Drawer.Screen name="Weather" component={AnalyticsScreen} />
      <Drawer.Screen name="Shop" component={ShopScreen} />
      <Drawer.Screen name="Community" component={CommunityScreen} />
      <Drawer.Screen name="AI Assistant" component={ChatbotScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={styles.splashText}>AgriSense</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: ({ current, layouts }) => ({
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
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Landing"  component={LandingScreen} />
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <Stack.Screen name="Main"     component={MainDrawer} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: '#0a0f1e', alignItems: 'center', justifyContent: 'center' },
  splashText: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 20, letterSpacing: 1 },
});
