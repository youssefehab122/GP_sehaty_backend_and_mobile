import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchWishlist,
  removeFromWishlist,
} from "../../store/slices/wishlistSlice";
import { addToCart } from "../../store/slices/cartSlice";
import { cartAPI } from "../../services/api";

const WishlistScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.wishlist);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemoveFromWishlist = async (id) => {
    try {
      await dispatch(removeFromWishlist(id)).unwrap();
    } catch (err) {
      Alert.alert("Error", "Failed to remove item from wishlist");
    }
  };

  const handleAddToCart = async (item) => {
    if (isAddingToCart) return; // Prevent multiple calls
    
    if (item.pharmacyInfo.stock <= 0) {
      Alert.alert("Error", "This medicine is out of stock");
      return;
    }

    try {
      setIsAddingToCart(true); // Set loading state

      // First check if item is already in cart
      const cartResponse = await cartAPI.getCart();
      const existingItem = cartResponse.items?.find(
        cartItem => cartItem.medicineId._id === item.medicineId
      );

      if (existingItem) {
        Alert.alert("Info", "Item is already in your cart");
        return;
      }

      // Add new item to cart
      const response = await cartAPI.addToCart(
        item.medicineId,
        1,
        item.pharmacyInfo.pharmacyId
      );

      if (!response || !response.items) {
        Alert.alert("Error", "Failed to add item to cart");
        return;
      }

      // Find the newly added item in the response
      const addedItem = response.items.find(
        cartItem => cartItem.medicineId._id === item.medicineId
      );

      if (!addedItem) {
        throw new Error('Could not find added item in cart response');
      }

      // Only dispatch the newly added item with quantity 1
      dispatch(
        addToCart({
          medicineId: addedItem.medicineId._id,
          pharmacyId: addedItem.pharmacyId._id,
          qty: 1,
          price: addedItem.price,
          name: addedItem.medicineId.name,
          image: addedItem.medicineId.image,
          description: addedItem.medicineId.description,
          isAvailable: true
        })
      );

      Alert.alert("Success", "Added to cart successfully!");
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to add item to cart");
    } finally {
      setIsAddingToCart(false); // Reset loading state
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemImageContainer}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
      </View>

      <View style={styles.itemDetails}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() =>
              handleRemoveFromWishlist(item.medicineId || item._id)
            }
          >
            <MaterialIcons name="close" size={20} color="#606060" />
          </TouchableOpacity>
        </View>

        <Text style={styles.itemQuantity}>
          Available:{" "}
          {item.pharmacyInfo ? item.pharmacyInfo.stock : item.quantity} units
        </Text>

        {item.pharmacyInfo && (
          <Text style={styles.pharmacyName}>
            {item.pharmacyInfo.pharmacyName}
          </Text>
        )}

        {(!item.pharmacyInfo || item.pharmacyInfo.stock <= 0) && (
          <View style={styles.outOfStockContainer}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("DrugAlternative", { outOfStockItem: item })
              }
            >
              <Text style={styles.findAlternativeText}>Find Alternative?</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.itemFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>
              EGP {item.pharmacyInfo ? item.pharmacyInfo.price : item.price}
            </Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>EGP {item.originalPrice}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.addToCartButton,
              (!item.pharmacyInfo || item.pharmacyInfo.stock <= 0 || isAddingToCart) &&
                styles.disabledButton,
            ]}
            onPress={() =>
              item.pharmacyInfo &&
              item.pharmacyInfo.stock > 0 &&
              !isAddingToCart &&
              handleAddToCart(item)
            }
            disabled={!item.pharmacyInfo || item.pharmacyInfo.stock <= 0 || isAddingToCart}
          >
            <Text style={styles.addToCartText}>
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="favorite-border" size={80} color="#1B794B" />
      <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
      <Text style={styles.emptySubtitle}>
        Save items you like to your wishlist so you can easily find them later
      </Text>
      <TouchableOpacity
        style={styles.shopNowButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.shopNowText}>Shop Now</Text>
      </TouchableOpacity>
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(fetchWishlist())}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <View style={{ width: 24 }} /> {/* For balance */}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1B794B" />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  itemCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
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
    justifyContent: "space-between",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#606060",
    marginTop: 4,
  },
  pharmacyName: {
    fontSize: 14,
    color: "#1B794B",
    marginTop: 4,
    fontWeight: "500",
  },
  outOfStockContainer: {
    marginTop: 8,
  },
  outOfStockText: {
    fontSize: 14,
    color: "#E53935",
    fontWeight: "bold",
  },
  findAlternativeText: {
    fontSize: 14,
    color: "#1B794B",
    fontWeight: "bold",
    marginTop: 2,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  priceContainer: {
    flexDirection: "column",
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#606060",
  },
  originalPrice: {
    fontSize: 14,
    color: "#A9A9A9",
    textDecorationLine: "line-through",
  },
  addToCartButton: {
    backgroundColor: "#1B794B",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
  },
  addToCartText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#606060",
    textAlign: "center",
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: "#1B794B",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shopNowText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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

export default WishlistScreen;
