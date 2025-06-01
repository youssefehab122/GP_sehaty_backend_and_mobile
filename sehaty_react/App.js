import React, { useEffect, useRef } from "react";
import {AppState, View, Linking, Platform ,StatusBar} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./store";
import AuthNavigator from "./navigation/AuthNavigator";
import MainNavigator from "./navigation/MainNavigator";
import { loadUser } from "./store/slices/authSlice";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as WebBrowser from "expo-web-browser";
import { navigationRef, navigate } from "./navigation/RootNavigation";
import { Alert } from 'react-native';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const AppContent = () => {
  const dispatch = useDispatch();
  const { user, isLoading, logoutSuccess } = useSelector((state) => state.auth);
  const notificationListener = useRef();
  const responseListener = useRef();

  // Handle logout success
  useEffect(() => {
    if (logoutSuccess) {
      // Reset navigation to Login screen
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [logoutSuccess]);

  const registerForFCMToken = async (userId) => {
    try {
      if (!Device.isDevice) return;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    } catch (err) {
    }
  };
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        const url = await Linking.getInitialURL();
        handleDeepLink(url);
      }
    });

    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Initial check
    Linking.getInitialURL().then(handleDeepLink);

    return () => {
      subscription.remove();
      linkingSubscription.remove();
    };
  }, []);
      const handleDeepLink = async (url) => {
    if (!url) return;
    
    if (url.includes('payment-complete')) {
      const orderId = url.split('/').pop();
      
      // Add slight delay for iOS
      await new Promise(resolve => setTimeout(resolve, 500));
      
      navigate("OrderSuccessScreen", {
      
          orderId,
          paymentMethod: "paymob",
          paymentCompleted: true
        
      });
    }
  };
  useEffect(() => {
  const handleDeepLink = async (url) => {
    if (!url) return;
    
    if (url.includes('payment-complete')) {
      const orderId = url.split('/').pop();
      
      // Add delay for navigation to work properly
      await new Promise(resolve => setTimeout(resolve, 500));
      
      navigate("OrderSuccessScreen", {
          orderId,
          paymentMethod: "paymob",
          paymentCompleted: true
        
      });
    }
  };

  // Handle app coming to foreground
  const subscription = AppState.addEventListener('change', async (nextAppState) => {
    if (nextAppState === 'active') {
      const url = await Linking.getInitialURL();
      handleDeepLink(url);
    }
  });

  // Handle URL events while app is running
  const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
    handleDeepLink(url);
  });

  // Initial URL check
  Linking.getInitialURL().then(handleDeepLink);

  return () => {
    subscription.remove();
    linkingSubscription.remove();
  };
}, []);
 useEffect(() => {



  const getInitialUrl = async () => {
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl && initialUrl.includes("payment-complete")) {
      const orderId = initialUrl.split("/").pop();
      navigate("OrderSuccessScreen", {
          orderId,
          paymentMethod: "paymob",
          paymentCompleted: true
        
      });
    }
  };

  getInitialUrl();

  const subscription = Linking.addEventListener("url", handleDeepLink);
  return () => subscription.remove();
}, []);

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
    });

    return () => {
      // Notifications.remove(notificationListener.current);
      // Notifications.remove(responseListener.current);
    };
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        const result = await dispatch(loadUser()).unwrap();
        if (result && result._id) {
          await registerForFCMToken(result._id);
        }
        await SplashScreen.hideAsync();
      } catch (e) {
        await SplashScreen.hideAsync();
      }
    };

    initialize();
  }, [dispatch]);

  if (isLoading) {
    return null;
  }

  return (
    <SafeAreaProvider style={{padding:5}}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer ref={navigationRef}>
          {user ? (
            <MainNavigator />
          ) : (
            <AuthNavigator />
          )}
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <View style={{ flex: 1 }}>
        <AppContent />
      </View>
    </Provider>
  );
}
