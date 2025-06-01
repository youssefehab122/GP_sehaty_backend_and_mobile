import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../../store/slices/cartSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { TrashIcon } from "react-native-heroicons/outline";
import { cartAPI } from "../../services/api";
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get("window");

export default function CartScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use useFocusEffect to refresh cart data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchCartData();
    }, [])
  );

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const cartData = await cartAPI.getCart();
      dispatch(fetchCart(cartData));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  };

  const total = calculateTotal();
  const deliveryFee = 25;
  const totalWithDelivery = total + deliveryFee;

  // Check if any item is out of stock
  const hasOutOfStockItems = items.some(item => !item.medicineId?.isAvailable);

  const handleRemoveItem = async (itemId) => {
    try {
      await cartAPI.removeFromCart({ medicineId: itemId._id, pharmacyId: itemId.pharmacyId._id });
      dispatch(removeFromCart({medicineId: itemId._id, pharmacyId: itemId.pharmacyId._id}));
    } catch (err) {
      alert('Failed to remove item from cart');
    }
  };

  const handleClearCart = async () => {
    try {
      await cartAPI.clearCart();
      dispatch(clearCart());
    } catch (err) {
      alert('Failed to clear cart');
    }
  };

  const handleUpdateQuantity = async (id, newQty) => {
    if (newQty >= 1) {
      try {
        await cartAPI.updateCartItem(id, newQty);
        dispatch(updateQuantity({ id, qty: newQty }));
      } catch (err) {
        alert('Failed to update quantity');
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B794B" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCartData}>
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
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <View style={{ width: 24 }} />
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.cartHeader}>
              <Text style={styles.itemCount}>
                {`Cart Items (${items.length} items)`}
              </Text>
              <TouchableOpacity onPress={handleClearCart}>
                <Text style={styles.clearAllText}>Remove All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.itemsContainer}>
              {items.map((item) => (
                <View key={item._id} style={styles.itemCard}>
                  <View style={styles.itemImageContainer}>
                    <Image 
                      source={{ uri: item.medicineId?.image || item.image }} 
                      style={styles.itemImage} 
                    />
                  </View>

                  <View style={styles.itemDetails}>
                    <View style={styles.topRow}>
                      <View style={styles.nameContainer}>
                        <View style={styles.titleRow}>
                          <Text style={styles.itemName}>
                            {item.medicineId?.name || item.name}
                          </Text>
                          {!item.medicineId?.isAvailable && (
                            <Text style={styles.outOfStockLabel}>
                              Out of Stock
                            </Text>
                          )}
                        </View>
                        <Text style={styles.itemQuantity}>
                          {`Quantity: ${item.quantity}`}
                        </Text>
                        {!item.medicineId?.isAvailable && (
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate("DrugAlternative", {
                                medicine: {
                                  _id: item.medicineId?._id || item._id,
                                  name: item.medicineId?.name || item.name,
                                  price: item.price,
                                  image: item.medicineId?.image || item.image,
                                  description: item.medicineId?.description,
                                  activeIngredient: item.medicineId?.activeIngredient,
                                  alternatives: item.medicineId?.alternatives,
                                  isAvailable: item.medicineId?.isAvailable,
                                  pharmacyInfo: item.medicineId?.pharmacyInfo
                                }
                              })
                            }
                          >
                            <Text style={styles.findAlternative}>
                              Find Alternative?
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.trashButton}
                        onPress={() => handleRemoveItem(item)}
                      >
                        <TrashIcon size={20} color="#606060" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.spacer} />

                    <View style={styles.bottomRow}>
                      <View style={styles.priceContainer}>
                        <Text style={styles.currentPrice}>
                          {`EGP ${item.price}`}
                        </Text>
                        {item.medicineId?.originalPrice && (
                          <Text style={styles.originalPrice}>
                            {`EGP ${item.medicineId.originalPrice}`}
                          </Text>
                        )}
                      </View>

                      <View style={styles.qtyContainer}>
                        <TouchableOpacity
                          style={styles.qtyButton}
                          onPress={() =>
                            handleUpdateQuantity(item._id, item.quantity - 1)
                          }
                        >
                          <Text style={styles.qtyButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.qtyButton}
                          onPress={() =>
                            handleUpdateQuantity(item._id, item.quantity + 1)
                          }
                        >
                          <Text style={styles.qtyButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.summaryContainer}>
              <View style={styles.summaryTopRow}>
                <View style={styles.priceSummary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total: </Text>
                    <Text style={styles.summaryValue}>{`EGP ${total.toFixed(2)}`}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabelDelivery}>Delivery: </Text>
                    <Text style={styles.summaryValueDelivery}>
                      {`EGP ${deliveryFee}`}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.checkoutButton,
                    hasOutOfStockItems && styles.disabledButton
                  ]}
                  onPress={() => navigation.navigate("Order")}
                  disabled={hasOutOfStockItems}
                >
                  <Text style={[
                    styles.checkoutButtonText,
                    hasOutOfStockItems && styles.disabledButtonText
                  ]}>
                    {hasOutOfStockItems ? 'Out of Stock Items' : 'Proceed to Checkout'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1B794B',
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#1B794B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff", // Ensure white background
  },
  itemCount: {
    fontSize: 16,
    color: "#606060",
    fontWeight: "500", // Slightly bolder
  },
  clearAllText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "500", // Slightly bolder
  },
  itemsContainer: {
    paddingHorizontal: 16,
  },
  itemCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  itemImageContainer: {
    width: 100,
    height: 100,
    marginRight: 12,
  },
  itemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 4,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between", // This helps with bottom alignment
  },
  spacer: {
    flex: 1, // This will push the bottom row down
    minHeight: 8, // Minimum space between content and bottom row
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginRight: 8,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#606060",
    marginTop: 2, // Reduced from 18 to make it closer
  },
  outOfStockLabel: {
    fontSize: 12,
    color: "#FF0000",
    fontWeight: "bold",
  },
  findAlternative: {
    fontSize: 14,
    color: "#1B794B",
    fontWeight: "bold",
    marginBottom: 2,
  },
  trashButton: {
    padding: 4,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 8, // Add some space above the bottom row
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#606060",
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: "#A9A9A9",
    textDecorationLine: "line-through",
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyButton: {
    borderWidth: 1,
    borderColor: "#D6D6D6",
    borderRadius: 10,
    width: 29,
    height: 29,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyButtonText: {
    color: "#1B5E20",
    fontSize: 16,
    fontWeight: "bold",
  },
  qtyText: {
    marginHorizontal: 12,
    fontSize: 16,
    color: "#1B5E20",
  },
  summaryContainer: {
    padding: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  summaryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  priceSummary: {
    flex: 1,
    marginRight: 16,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#000",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  summaryLabelDelivery: {
    fontSize: 14,
    color: "#000",
  },
  summaryValueDelivery: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  checkoutButton: {
    backgroundColor: "#1B794B",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    minWidth: "60%",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  disabledButtonText: {
    color: "#666",
  },
});