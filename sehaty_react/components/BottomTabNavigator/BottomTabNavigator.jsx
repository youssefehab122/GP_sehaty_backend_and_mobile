import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  CalendarIcon, 
  UserIcon, 
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon 
} from 'react-native-heroicons/outline';
import HomeScreen from '../../screens/Home/HomeScreen';
import CartScreen from '../../screens/Order/CartScreen';
import PharmaciesScreen from '../../screens/Pharmacy/PharmaciesScreen';
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import ReminderScreen from '../../screens/Reminders/ReminderScreen';
import OrdersScreen from '../../screens/Order/OrdersScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconComponent;

          switch (route.name) {
            case 'Home':
              iconComponent = <HomeIcon width={size} height={size} color={color} />;
              break;
            case 'Pharmacies':
              iconComponent = <BuildingStorefrontIcon width={size} height={size} color={color} />;
              break;
            case 'Cart':
              iconComponent = <ShoppingCartIcon width={size} height={size} color={color} />;
              break;
            case 'Orders':
              iconComponent = <ClipboardDocumentListIcon width={size} height={size} color={color} />;
              break;
            case 'Reminder':
              iconComponent = <CalendarIcon width={size} height={size} color={color} />;
              break;
            case 'Profile':
              iconComponent = <UserIcon width={size} height={size} color={color} />;
              break;
          }

          return iconComponent;
        },
        tabBarActiveTintColor: '#1B794B',
        tabBarInactiveTintColor: '#606060',
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
        tabBarStyle: {
          height: 80, 
          paddingTop: 8,
          paddingBottom: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home'
        }}
      />
      <Tab.Screen 
        name="Pharmacies" 
        component={PharmaciesScreen}
        options={{
          title: 'Pharmacies'
        }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          title: 'Cart'
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{
          title: 'Orders'
        }}
      />
      <Tab.Screen 
        name="Reminder" 
        component={ReminderScreen}
        options={{
          title: 'Reminders'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
}
