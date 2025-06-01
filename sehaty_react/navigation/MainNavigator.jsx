import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from '../components/BottomTabNavigator/BottomTabNavigator';
import DrugAlternativeScreen from '../screens/Drugs/DrugAlternativeScreen';
import ProductScreen from '../screens/Drugs/ProductScreen';
import MedicinesScreen from '../screens/Drugs/MedicinesScreen';
import ChooseAddressScreen from '../screens/Maps/ChooseAddress';
import AddressListScreen from '../screens/Maps/AddressListScreen';
import PharmacyMedicinesScreen from '../screens/Pharmacy/PharmacyMedicinesScreen';
import SearchScreen from '../screens/Search/SearchScreen';
import WishlistScreen from '../screens/Wishlist/WishlistScreen';
import PaymentScreen from '../screens/Order/PaymentScreen';
import OrderSuccessScreen from '../screens/Order/OrderSuccessScreen';
import OrderFailureScreen from '../screens/Order/OrderFailureScreen';
import OrderTrackingScreen from "../screens/Order/OrderTrackingScreen";
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import OrderScreen from '../screens/Order/OrderScreen';
import PrescriptionDetailsScreen from '../screens/Prescription/PrescriptionDetailsScreen';
import PrescriptionListScreen from '../screens/Prescription/PrescriptionListScreen';
import AddReminder from '../screens/Reminders/AddReminder';
import HomeScreen from '../screens/Home/HomeScreen';
import CartScreen from '../screens/Order/CartScreen';
import PharmaciesScreen from '../screens/Pharmacy/PharmaciesScreen';
const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      
      {/* Modal and detail screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="DrugAlternative" component={DrugAlternativeScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="Medicines" component={MedicinesScreen} />
      <Stack.Screen name="Order" component={OrderScreen} />
      <Stack.Screen name="Map" component={ChooseAddressScreen} />
      <Stack.Screen name="Pharmacies" component={PharmaciesScreen} />

      <Stack.Screen name="PharmacyMedicines" component={PharmacyMedicinesScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="AddressListScreen" component={AddressListScreen} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      <Stack.Screen name="OrderSuccessScreen" component={OrderSuccessScreen} />
      <Stack.Screen name="OrderFailureScreen" component={OrderFailureScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="PrescriptionDetails" component={PrescriptionDetailsScreen} />
      <Stack.Screen name="PrescriptionList" component={PrescriptionListScreen} />
      <Stack.Screen name="AddReminder" component={AddReminder} />
      
    </Stack.Navigator>
  );
}
