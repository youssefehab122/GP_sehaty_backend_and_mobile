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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../../store/slices/cartSlice";
import { addressesAPI, cartAPI } from "../../services/api";

const OrderScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressesAPI.getAddresses();
      setAddresses(data);
      // Set default address if available
      const defaultAddress = data.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      Alert.alert(
        "No Address Selected",
        "Please select a delivery address to continue.",
        [
          {
            text: "Select Address",
            onPress: () => navigation.navigate("AddressListScreen", { 
              isCheckout: true,
              onAddressSelect: (address) => {
                setSelectedAddress(address);
                navigation.goBack();
              }
            }),
          },
        ]
      );
      return;
    }

    // Prepare order data
    const orderData = {
      selectedAddress,
      cartItems: items,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: total
    };

    navigation.navigate("PaymentScreen", orderData);
  };

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    return sum + (price * quantity);
  }, 0);

  const deliveryFee = 25;
  const total = subtotal + deliveryFee;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B794B" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}> 
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAddresses}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Place Order</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Delivery Address Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              {selectedAddress && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("AddressListScreen", {
                    isCheckout: true,
                    onAddressSelect: (address) => {
                      setSelectedAddress(address);
                      navigation.goBack();
                    }
                  })}
                >
                  <Text style={styles.changeText}>Change</Text>
                </TouchableOpacity>
              )}
            </View>

            {selectedAddress ? (
              <View style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <Text style={styles.addressTitle}>{selectedAddress.title}</Text>
                  {selectedAddress.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addressText}>{selectedAddress.address}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addAddressButton}
                onPress={() => navigation.navigate("AddressListScreen", {
                  isCheckout: true,
                  onAddressSelect: (address) => {
                    setSelectedAddress(address);
                    navigation.goBack();
                  }
                })}
              >
                <Text style={styles.addAddressText}>Select Delivery Address</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Order Summary Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.orderSummaryCard}>
              {items.map((item) => (
                <View key={item._id} style={styles.orderItem}>
                  <View style={styles.orderItemDetails}>
                    <Text style={styles.orderItemName}>{item.medicineId.name}</Text>
                    <Text style={styles.orderItemQuantity}>
                      {item.quantity} x {item.price} EGP
                    </Text>
                  </View>
                  <Text style={styles.orderItemPrice}>
                    EGP {(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  EGP {subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>EGP {deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  EGP {total.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Proceed to Payment Button */}
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={handleProceedToPayment}
          >
            <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  changeText: {
    fontSize: 14,
    color: "#1B794B",
    fontWeight: "500",
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
  defaultBadge: {
    backgroundColor: "#1B794B",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  addressText: {
    fontSize: 14,
    color: "#606060",
    lineHeight: 20,
  },
  addAddressButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1B794B",
    alignItems: "center",
  },
  addAddressText: {
    color: "#1B794B",
    fontSize: 16,
    fontWeight: "500",
  },
  orderSummaryCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderItemDetails: {
    flex: 1,
    marginRight: 16,
  },
  orderItemName: {
    fontSize: 14,
    color: "#000",
    marginBottom: 4,
  },
  orderItemQuantity: {
    fontSize: 12,
    color: "#606060",
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#606060",
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B794B",
  },
  proceedButton: {
    backgroundColor: "#1B794B",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  proceedButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#1B794B",
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default OrderScreen; 