import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../../store/slices/cartSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { cartAPI } from "../../services/api";
import * as WebBrowser from "expo-web-browser";

const PaymentScreen = ({ navigation, route }) => {
  const { selectedAddress, cartItems } = route.params || {};
  const dispatch = useDispatch();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [userBalance, setUserBalance] = useState(1000); // Mock balance in EGP

  // Calculate total price
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const deliveryFee = 25;
  const total = subtotal + deliveryFee;

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handlePaymobPayment = async (response, paymentUrl) => {
    // Use the deep link as return URL
    const returnUrl = response.deepLink;

    // Open browser with return URL
    const result = await WebBrowser.openAuthSessionAsync(
      paymentUrl,
      returnUrl,
      {
        showInRecents: true,
        preferEphemeralSession: true,
      }
    );

    // Close browser regardless of result
    await WebBrowser.dismissBrowser();

    // Handle iOS-specific behavior
    if (Platform.OS === "ios") {
      if (result.type === "cancel" && result.url) {
        Linking.openURL(returnUrl);
      }
    }

    // Check if payment was successful
    if (result.type === "success" || result.url?.includes("payment-complete")) {
      // Navigate to success screen
      navigation.navigate("OrderSuccessScreen", {
        orderId: response._id,
        paymentMethod: "paymob",
        total: total,
        paymentCompleted: true,
      });
    } else {
      // Navigate to failure screen
      navigation.navigate("OrderFailureScreen", {
        error: "Payment was not completed. Please try again.",
        orderData: {
          selectedAddress,
          cartItems,
          total,
        },
        paymentMethod: "paymob",
      });
    }
  };
  const handlePlaceOrder = async () => {
    // Check if wallet balance is sufficient when using wallet payment
    if (selectedPaymentMethod === "wallet" && userBalance < total) {
      Alert.alert(
        "Insufficient Balance",
        `Your wallet balance (EGP ${userBalance.toFixed(
          2
        )}) is less than the total amount (EGP ${total.toFixed(2)}).`,
        [
          { text: "Add Funds", onPress: () => console.log("Add funds") },
          { text: "Change Payment Method", style: "cancel" },
        ]
      );
      return;
    }

    setIsProcessing(true);

    try {
      // Validate cart items
      if (!cartItems || cartItems.length === 0) {
        throw new Error("No items in cart");
      }

      // Create order data with proper item structure
      const orderData = {
        address: selectedAddress._id,
        items: cartItems.map((item) => {
          // Validate required fields
          if (!item.medicineId || !item.pharmacyId) {
            throw new Error("Invalid item data in cart");
          }

          return {
            medicineId: item.medicineId,
            pharmacyId: item.pharmacyId,
            quantity: parseInt(item.quantity) || 0,
            price: parseFloat(item.price) || 0,
          };
        }),
        paymentMethod: selectedPaymentMethod,
        subtotal: parseFloat(subtotal.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        status: "pending",
      };

      // Call the API to create the order
      const response = await cartAPI.createOrder(orderData);

      // Handle Paymob payment flow
      if (selectedPaymentMethod === "paymob" && response.paymentUrl) {
        setIsProcessing(false);
        return handlePaymobPayment(response, response.paymentUrl);
      }

      // If using wallet, deduct balance
      if (selectedPaymentMethod === "wallet") {
        const newBalance = userBalance - total;
        setUserBalance(newBalance);
        await AsyncStorage.setItem("@user_balance", newBalance.toString());
      }

      // Clear cart
      dispatch(clearCart());

      // Navigate to success screen
      navigation.navigate("OrderSuccessScreen", {
        orderId: response._id,
        total,
        paymentMethod: selectedPaymentMethod,
      });
    } catch (error) {
      Alert.alert(
        "Order Failed",
        error.response?.data?.message ||
          error.message ||
          "Failed to process your order. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedAddress) {
    // If no address is selected, redirect to address selection
    useEffect(() => {
      Alert.alert(
        "No Address Selected",
        "Please select a delivery address to continue.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("AddressListScreen", { isCheckout: true }),
          },
        ]
      );
    }, []);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1B794B" />
          <Text style={styles.loadingText}>
            Redirecting to address selection...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.itemsContainer}>
            {cartItems.map((item) => (
              <View key={item._id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {item.medicineId?.name || item.name}
                  </Text>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  EGP {item.price * item.quantity}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Ionicons name="location-outline" size={24} color="#1B794B" />
              <Text style={styles.addressTitle}>
                {selectedAddress?.title || "Default Address"}
              </Text>
            </View>
            <Text style={styles.addressText}>{selectedAddress?.address}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === "cash" && styles.selectedPayment,
              ]}
              onPress={() => handlePaymentMethodSelect("cash")}
            >
              <FontAwesome name="money" size={24} color="#1B794B" />
              <Text style={styles.paymentText}>Cash on Delivery</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === 'wallet' && styles.selectedPayment
              ]}
              onPress={() => handlePaymentMethodSelect('wallet')}
            >
              <MaterialIcons name="account-balance-wallet" size={24} color="#1B794B" />
              <Text style={styles.paymentText}>Wallet (EGP {userBalance})</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === "paymob" && styles.selectedPayment,
              ]}
              onPress={() => handlePaymentMethodSelect("paymob")}
            >
              <FontAwesome name="cc-visa" size={24} color="#1B794B" />
              <Text style={styles.paymentText}>Credit/Debit Card</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Summary</Text>
          <View style={styles.priceSummary}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>EGP {subtotal}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text style={styles.priceValue}>EGP {deliveryFee}</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>EGP {total}</Text>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          {/* Pay Button */}
          <TouchableOpacity
            style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
            onPress={handlePlaceOrder}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>
                {selectedPaymentMethod === "wallet"
                  ? "Pay with Wallet"
                  : selectedPaymentMethod === "paymob"
                  ? "Pay with Card"
                  : "Pay on Delivery"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#606060",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#E8F5E9",
  },
  backButton: {
    width: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B794B",
    textAlign: "center",
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom:15,
  },
  itemsContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B794B",
  },
  addressCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginRight: 8,
  },
  addressText: {
    fontSize: 14,
    color: "#606060",
    lineHeight: 20,
  },
  paymentMethods: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  selectedPayment: {
    backgroundColor: "#F1F8E9",
  },
  paymentText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginLeft: 12,
  },
  priceSummary: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#606060",
  },
  priceValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B794B",
  },
  payButton: {
    backgroundColor: "#1B794B",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marignTop: 10,

    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PaymentScreen;
