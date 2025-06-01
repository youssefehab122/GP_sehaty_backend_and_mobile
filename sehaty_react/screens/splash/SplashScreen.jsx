import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import SplashScreen from 'react-native-splash-screen'; // Import splash screen library

const { width, height } = Dimensions.get('window');

export default function Splash() {
  useEffect(() => {
    // Hide splash screen after 3 seconds (you can customize the duration)
    setTimeout(() => {
      SplashScreen.hide(); // Hides the splash screen
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/sehaty_logo.png')} style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: width * 0.5,  // Logo width
    height: height * 0.3,  // Logo height
    resizeMode: 'contain',
  },
});
