import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { cartAPI } from '../../services/api';

const OrderSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, total = 0, paymentMethod, paymentCompleted } = route.params || {};
  const [isVerifying, setIsVerifying] = useState(false);

  // Add payment verification
  const verifyPaymentStatus = async () => {
    if (paymentMethod !== 'paymob' || paymentCompleted) return;
    
    try {
      setIsVerifying(true);
      const response = await cartAPI.verifyPayment(orderId);
      
      if (response.isPaid) {
        navigation.replace("OrderSuccessScreen", {
          orderId,
          total,
          paymentMethod,
          paymentCompleted: true
        });
      }
    } catch (error) {
      console.error('[PAYMENT VERIFICATION] Error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    const handleDeepLink = async (event) => {
      console.log('[DEEP LINK] Received URL:', event.url);
      
      if (event.url.includes('payment-complete')) {
        const orderIdFromUrl = event.url.split('/').pop();
        console.log('[DEEP LINK] Extracted order ID:', orderIdFromUrl);
        
        if (orderIdFromUrl === orderId) {
          // Verify payment status when deep link is received
          await verifyPaymentStatus();
        }
      }
    };

    // Add event listener
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL
    const checkInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    };

    checkInitialURL();

    // Start polling for payment status if it's a Paymob payment
    let pollInterval;
    if (paymentMethod === 'paymob' && !paymentCompleted) {
      pollInterval = setInterval(verifyPaymentStatus, 5000); // Poll every 5 seconds
    }

    // Clean up
    return () => {
      subscription.remove();
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [orderId, paymentMethod, total, paymentCompleted]);

  const handleTrackOrder = () => {
    navigation.navigate('OrderTracking', { orderId });
  };

  const handleViewOrders = () => {
    navigation.navigate('MainTabs', { screen: 'Orders' });
  };

  const handleContinueShopping = () => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  // For Paymob payments, show different messaging
  const isPaymobPending = paymentMethod === 'paymob' && !paymentCompleted;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {isPaymobPending ? (
            <>
              <Ionicons name="time-outline" size={80} color="#FFA000" />
              {isVerifying && (
                <View style={styles.verifyingContainer}>
                  <ActivityIndicator size="small" color="#FFA000" />
                  <Text style={styles.verifyingText}>Verifying payment...</Text>
                </View>
              )}
            </>
          ) : (
            <Ionicons name="checkmark-circle" size={80} color="#1B794B" />
          )}
        </View>

        <Text style={styles.title}>
          {isPaymobPending ? 'Payment Processing' : 'Order Placed Successfully!'}
        </Text>
        
        <Text style={styles.subtitle}>
          {isPaymobPending
            ? 'Your payment is being processed. We will notify you when it is confirmed.'
            : 'Thank you for your order. We\'ll notify you when it\'s ready.'}
        </Text>

        <View style={styles.orderDetails}>
          <Text style={styles.orderId}>Order #{orderId}</Text>
          <Text style={styles.amount}>EGP {total.toFixed(2)}</Text>
          <Text style={styles.paymentMethod}>
            {isPaymobPending ? 'Processing via Paymob' : `Paid via ${paymentMethod}`}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {!isPaymobPending && (
            <>
              <TouchableOpacity
                style={[styles.button, styles.trackButton]}
                onPress={handleTrackOrder}
              >
                <Text style={styles.buttonText}>Track Order</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.ordersButton]}
                onPress={handleViewOrders}
              >
                <Text style={styles.buttonText}>View Orders</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, styles.shopButton]}
            onPress={handleContinueShopping}
          >
            <Text style={styles.buttonText}>
              {isPaymobPending ? 'Back to Home' : 'Continue Shopping'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  orderDetails: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  orderId: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B794B',
    marginBottom: 10,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackButton: {
    backgroundColor: '#1B794B',
  },
  ordersButton: {
    backgroundColor: '#4CAF50',
  },
  shopButton: {
    backgroundColor: '#81C784',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifyingContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  verifyingText: {
    marginTop: 5,
    color: '#FFA000',
    fontSize: 12,
  },
});

export default OrderSuccessScreen;

