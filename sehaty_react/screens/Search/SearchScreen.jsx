import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { productsAPI, wishlistAPI, cartAPI } from "../../services/api";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import { addToWishlist, removeFromWishlist } from "../../store/slices/wishlistSlice";
import { useNavigation } from '@react-navigation/native';

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.items);

  // Handle search when query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        handleSearch();
      } else if (searchQuery.trim().length === 0) {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (searchQuery.trim().length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const results = await productsAPI.searchProducts(searchQuery);
      
      // Process results to combine duplicate medicines with different pharmacy options
      const processedResults = results.reduce((acc, item) => {
        const existingItem = acc.find(i => i._id === item._id);
        if (existingItem) {
          // If pharmacy info doesn't exist in the item, add it
          if (!existingItem.pharmacyOptions) {
            existingItem.pharmacyOptions = [existingItem.pharmacyInfo];
          }
          // Add new pharmacy option if it doesn't exist
          if (item.pharmacyInfo && !existingItem.pharmacyOptions.some(p => p.pharmacyId === item.pharmacyInfo.pharmacyId)) {
            existingItem.pharmacyOptions.push(item.pharmacyInfo);
          }
        } else {
          // Create new item with pharmacy options array
          acc.push({
            ...item,
            pharmacyOptions: item.pharmacyInfo ? [item.pharmacyInfo] : []
          });
        }
        return acc;
      }, []);

      setSearchResults(processedResults);
    } catch (error) {
      setError("Failed to search products. Please try again.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    Keyboard.dismiss();
  };

  const toggleFavorite = async (item) => {
    try {
      // Check if item is in wishlist using medicineId
      const isInWishlist = wishlist.some((wishlistItem) => wishlistItem.medicineId === item._id);
      
      if (isInWishlist) {
        // Remove from wishlist using medicineId
        await dispatch(removeFromWishlist(item._id)).unwrap();
      } else {
        // Add to wishlist with just the medicineId
        await dispatch(addToWishlist(item._id)).unwrap();
      }
    } catch (err) {
      alert('Failed to update wishlist. Please try again.');
    }
  };

  const handleAddToCart = async (item) => {
    try {
      // Get the pharmacy with the lowest price
      const bestPharmacy = item.pharmacyOptions?.reduce((best, current) => {
        if (!best || current.price < best.price) {
          return current;
        }
        return best;
      }, null);

      if (!bestPharmacy) {
        throw new Error('No pharmacy available for this item');
      }

      // Add to cart with the best pharmacy's information
      await cartAPI.addToCart(item._id, 1,bestPharmacy.pharmacyId);
      
      dispatch(addToCart({
        medicineId:item._id,
        pharmacyId:bestPharmacy.pharmacyId,
        qty: 1,
        price: bestPharmacy.price,
        pharmacyInfo: bestPharmacy,
        isAvailable: bestPharmacy.isAvailable
      }));
      
      alert(`${item.name} added to cart!`);
    } catch (err) {
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const renderItem = ({ item }) => {
    // Check if item is in wishlist using medicineId
    const isInWishlist = wishlist.some((wishlistItem) => wishlistItem.medicineId === item._id);
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate("Product", { product: item })}
      >
        <View style={styles.productImageContainer}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.productImage} 
          />
        </View>
        <View style={styles.productDetails}>
          <View style={styles.productHeader}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            <TouchableOpacity
              onPress={() => toggleFavorite(item)}
              style={styles.favoriteButton}
            >
              <AntDesign
                name={isInWishlist ? "heart" : "hearto"}
                size={18}
                color={isInWishlist ? "#E53935" : "#1B794B"}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.productQuantity}>{item.quantity}</Text>
          {!item.isAvailable && (
            <View style={styles.outOfStockContainer}>
              <Text style={styles.outOfStock}>Out of Stock</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("DrugAlternative", {
                  medicine: {
                    _id: item._id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    description: item.description,
                    activeIngredient: item.activeIngredient,
                    alternatives: item.alternatives,
                    isAvailable: item.isAvailable,
                    pharmacyInfo: item.pharmacyInfo
                  }
                })}
              >
                <Text style={styles.findAlternative}>Find Alternative?</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.productFooter}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {`EGP ${item.pharmacyOptions?.[0]?.price || item.price}`}
              </Text>
              {item.pharmacyOptions?.[0]?.discount > 0 && (
                <Text style={styles.originalPrice}>
                  {`EGP ${item.price}`}
                </Text>
              )}
            </View>
            {item.isAvailable && (
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={() => handleAddToCart(item)}
              >
                <Text style={styles.addToCartText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
          {item.pharmacyOptions?.length > 1 && (
            <Text style={styles.availableAt}>
              {`Available at ${item.pharmacyOptions.length} pharmacies`}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#606060" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines, symptoms..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={20} color="#606060" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1B794B" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleSearch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={(item) => `${item._id}_${item.name}`}
          contentContainerStyle={styles.resultsList}
        />
      ) : searchQuery.length > 2 ? (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={64} color="#1B794B" />
          <Text style={styles.noResultsText}>No results found</Text>
          <Text style={styles.noResultsSubtext}>
            Try different keywords or check the spelling
          </Text>
        </View>
      ) : (
        <View style={styles.initialStateContainer}>
          <Ionicons name="search" size={64} color="#1B794B" />
          <Text style={styles.initialStateText}>
            Search for medicines, symptoms, or health conditions
          </Text>
        </View>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#E53935",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#1B794B",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultsList: {
    padding: 16,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#606060",
    textAlign: "center",
  },
  initialStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  initialStateText: {
    fontSize: 16,
    color: "#606060",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
  },
  productCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  productImageContainer: {
    width: 80,
    height: 80,
    marginRight: 12,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 4,
  },
  productDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  productQuantity: {
    fontSize: 14,
    color: "#606060",
    marginTop: 4,
  },
  outOfStockContainer: {
    marginTop: 4,
  },
  outOfStock: {
    fontSize: 12,
    color: "#E53935",
    fontWeight: "bold",
  },
  findAlternative: {
    fontSize: 12,
    color: "#1B794B",
    fontWeight: "bold",
    marginTop: 2,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
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
  addToCartButton: {
    backgroundColor: "#1B794B",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  availableAt: {
    fontSize: 12,
    color: '#1B794B',
    marginTop: 4,
  },
});

export default SearchScreen;
