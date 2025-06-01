import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { cartAPI, productsAPI } from '../../services/api';

const OrderTrackingScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setError('Order ID is required');
      setLoading(false);
      return;
    }
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartAPI.getOrderDetails(orderId);
      
      if (response && response.order) {
        // Validate order data
        if (!response.order.items || !Array.isArray(response.order.items)) {
          throw new Error('Invalid order items data');
        }

        // Calculate order summary
        const subtotal = response.order.items.reduce((sum, item) => {
          const itemTotal = (item.price || 0) * (item.quantity || 0);
          return sum + itemTotal;
        }, 0);

        const deliveryFee = 20; // Fixed delivery fee
        const total = subtotal + deliveryFee;

        // Add calculated values to order
        const enhancedOrder = {
          ...response.order,
          summary: {
            subtotal,
            deliveryFee,
            total
          }
        };

        setOrder(enhancedOrder);
        setDelivery(response.delivery);
      } else {
        throw new Error('Invalid order data received');
      }
    } catch (err) {
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return '#757575';
    
    switch (status.toLowerCase()) {
      case 'delivered':
        return '#1B794B';
      case 'shipped':
        return '#1976D2';
      case 'pending':
        return '#FFA000';
      case 'processing':
        return '#1B794B';
      case 'cancelled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "time-outline";
      case "processing":
        return "sync-outline";
      case "shipped":
        return "car-outline";
      case "delivered":
        return "checkmark-circle-outline";
      case "cancelled":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (err) {
      return 'Invalid date';
    }
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `EGP ${price.toFixed(2)}`;
    }
    return 'Price not available';
  };

  const renderOrderItem = (item, index) => {
    // Get medicine details from the populated data
    const medicine = item.medicine || {};
    
    return (
      <View key={item._id || index} style={styles.itemCard}>
        <Image
          source={{ uri: medicine.image }}
          style={styles.itemImage}
          defaultSource={require('../../assets/sehaty_logo.png')}
        />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>
            {medicine.name || medicine.title || `Item ${index + 1}`}
          </Text>
          <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
          <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
        </View>
      </View>
    );
  };

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
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrderDetails}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrderDetails}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
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
          <Text style={styles.headerTitle}>Track Order</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Order Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Ionicons
                name={getStatusIcon(order.status)}
                size={24}
                color={getStatusColor(order.status)}
              />
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
              </Text>
            </View>
            <Text style={styles.orderId}>Order ID: {order._id}</Text>
            <Text style={styles.orderDate}>
              Ordered on: {formatDate(order.createdAt)}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.itemsContainer}>
            {order.items && order.items.map(renderOrderItem)}
          </View>
        </View>

        {/* Delivery Status */}
        {delivery && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Status</Text>
            <View style={styles.deliveryCard}>
              <View style={styles.deliveryHeader}>
                <Ionicons name="car-outline" size={24} color="#1B794B" />
                <Text style={styles.deliveryTitle}>Delivery Status</Text>
              </View>
              <Text style={[styles.deliveryStatus, { color: getStatusColor(delivery.status) }]}>
                {delivery.status ? delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1) : 'Unknown'}
              </Text>
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {formatPrice(order.summary?.subtotal || 0)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>
                {formatPrice(order.summary?.deliveryFee || 20)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatPrice(order.summary?.total || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              {order.paymentMethod === 'cash' ? (
                <FontAwesome name="money" size={24} color="#1B794B" />
              ) : (
                <FontAwesome5 name="cc-visa" size={24} color="#1B794B" />
              )}
              <Text style={styles.paymentText}>
                {order.paymentMethod }
              </Text>
            </View>
            <Text style={styles.paymentStatus}>
              Payment Status: {order.isPaid ? 'Paid' : 'Pending'}
            </Text>
          </View>
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
    paddingBottom: 20,
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
    marginBottom: 8,
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  orderId: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
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
  itemCard: {
    flexDirection: "row",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B794B",
  },
  deliveryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 8,
  },
  deliveryStatus: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#606060",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
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
  paymentCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginLeft: 12,
  },
  paymentStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});

export default OrderTrackingScreen; 