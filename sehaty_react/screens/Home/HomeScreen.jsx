import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  FlatList,
  Animated,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  HeartIcon,
} from "react-native-heroicons/outline";
import { ChevronRightIcon } from "react-native-heroicons/solid";
import { useSelector, useDispatch } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { productsAPI, pharmacyAPI, cartAPI, addressesAPI } from "../../services/api";
import { formatPriceWithCurrency } from "../../utils/priceFormatter";
import defaultProfile from "../../assets/sehaty_logo.png";
import MedicineCard from "../../components/MedicineCard/MedicineCard";
import { fetchWishlist } from "../../store/slices/wishlistSlice";
import { setSelectedAddress } from "../../store/slices/addressSlice";
import Constants from 'expo-constants';

// Get the API URL from environment variables
const API_URL = Constants.expoConfig?.extra?.API_URL || ' https://9e96-197-57-121-35.ngrok-free.app/api';

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const scrollY = useRef(new Animated.Value(0)).current;
  const user = useSelector((state) => state.auth.user);
  const selectedAddress = useSelector((state) => state.address.selected);

  const [products, setProducts] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch addresses and set default address
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await addressesAPI.getAddresses();
        // Set default address if available
        const defaultAddress = data.find(addr => addr.isDefault);
        if (defaultAddress) {
          dispatch(setSelectedAddress(defaultAddress));
        } else if (user?.defaultAddress) {
          dispatch(setSelectedAddress(user.defaultAddress));
        }
      } catch (err) {
        console.error("Error fetching addresses:", err);
      }
    };

    if (user) {
      fetchAddresses();
    }
  }, [dispatch, user]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchData();
    dispatch(fetchWishlist());
  }, [dispatch]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productsData, pharmaciesData, categoriesData] = await Promise.all([
        productsAPI.getProducts({ limit: 10 }),
        pharmacyAPI.getPharmacies({ limit: 5 }),
        productsAPI.getCategories()
      ]);
     
      if (!productsData?.medicines || !pharmaciesData?.pharmacies) {
        throw new Error('Invalid data format received from API');
      }

      // Remove duplicate products by using a Map with _id as key
      const uniqueProducts = Array.from(
        new Map(productsData.medicines.map(item => [item._id, item])).values()
      );

      setProducts(uniqueProducts);
      setPharmacies(pharmaciesData.pharmacies);
      setCategories(categoriesData.categories || []);
      
    } catch (err) {
      let errorMessage = 'Failed to load data. ';
      
      if (err.message === 'Network Error') {
        errorMessage += 'Please check your internet connection and make sure the server is running.';
      } else if (err.response?.status === 404) {
        errorMessage += 'The server endpoint was not found.';
      } else if (err.response?.status === 500) {
        errorMessage += 'Server error occurred. Please try again later.';
      } else {
        errorMessage += err.message || 'Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      // Get the pharmacy info from the product
      const pharmacyInfo = product.pharmacyInfo;
      if (!pharmacyInfo) {
        Alert.alert('Error', 'This medicine is not available in any pharmacy');
        return;
      }
      await cartAPI.addToCart(product._id, 1, pharmacyInfo.pharmacyId);
      Alert.alert('Success', 'Item added to cart successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add item to cart');
    }
  };

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [0, -180],
    extrapolate: "clamp",
  });

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
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={fetchData}
          activeOpacity={0.7}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          { transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        <SafeAreaView edges={["top"]} style={styles.safeAreaHeader}>
          <View style={styles.header}>
            <View style={styles.profileContainer}>
              <View style={styles.imageContainer}>
                <Image source={defaultProfile} style={styles.image} />
              </View>
              <View>
                <Text style={styles.welcomeText}>Welcome!</Text>
                <Text style={styles.userName}>{user?.name || "Guest"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <MagnifyingGlassIcon
              size={20}
              color="#A9A9A9"
              style={styles.searchIcon}
            />
            <TouchableOpacity
              style={styles.searchInput}
              onPress={() => navigation.navigate("Search")}
            >
              <Text style={styles.searchPlaceholder}>Search ...</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddressListScreen")}
          >
            <View style={styles.locationContainer}>
              <MapPinIcon size={20} color="#1B794B" />
              <Text style={styles.locationText}>Delivering to</Text>
              <Text style={styles.locationAddress}>
                {selectedAddress?.address || user?.defaultAddress?.address || "Select delivery address"}
              </Text>
              <ChevronRightIcon size={20} color="#1B794B" />
            </View>
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1B794B']}
            tintColor="#1B794B"
          />
        }
      >
        {/* Spacer to account for header height */}
        <View style={styles.scrollSpacer} />

        <View style={styles.bodyContainer}>
          {/* Categories */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Medicines")}>
                <Text style={styles.viewAll}>View all</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryCard}
                  onPress={() => navigation.navigate("Medicines", { categoryId: item._id })}
                >
                  <View style={styles.categoryIconContainer}>
                    <Image 
                      source={{ 
                        uri: item.image || 'https://via.placeholder.com/150'
                      }} 
                      style={styles.categoryIcon} 
                    />
                  </View>
                  <Text style={styles.categoryName} numberOfLines={2}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item._id}
            />
          </View>

          {/* Products */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>You may also need</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Medicines")}>
                <Text style={styles.viewAll}>View all</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={products}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => `home-product-${item._id}`}
              renderItem={({ item }) => (
                <View style={styles.productCardContainer}>
                  <MedicineCard medicine={item} />
                </View>
              )}
              contentContainerStyle={styles.productsContainer}
            />
          </View>

          {/* Pharmacies */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Pharmacies</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Pharmacies")}>
                <Text style={styles.viewAll}>View all</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={pharmacies}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pharmacyContainer}
              keyExtractor={(item) => `home-pharmacy-${item._id}`}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.pharmacyItem}
                  onPress={() => navigation.navigate("PharmacyMedicines", { pharmacy: item })}
                >
                  <View style={styles.pharmacyImageContainer}>
                    <Image 
                      source={{ 
                        uri: item.logo || item.image || 'https://via.placeholder.com/150'
                      }} 
                      style={styles.pharmacyImage} 
                    />
                  </View>
                  <Text style={styles.pharmacyText} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.pharmacyRating}>⭐ {item.rating || 'N/A'}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#1B794B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  safeAreaHeader: {
    backgroundColor: "#D6D6D6",
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "#D6D6D6",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 16,
    paddingBottom: 20,
    overflow: "hidden",
  },
  header: {
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 50,
    paddingBottom: 80,
  },
  scrollSpacer: {
    height: 200, // Should match your header height
  },
  bodyContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#1B794B",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginRight: 15,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  userName: {
    fontSize: 16,
    color: "#606060",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  searchPlaceholder: {
    fontSize: 16,
    color: "#A9A9A9",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 12,
  },
  locationText: {
    marginLeft: 8,
    marginRight: 4,
    color: "#606060",
    fontSize: 14,
  },
  locationAddress: {
    flex: 1,
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  viewAll: {
    color: "#1B794B",
    fontSize: 14,
    fontWeight: "bold",
  },
  productsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  productCardContainer: {
    width: width * 0.55,
    marginRight: 16,
  },
  pharmacyContainer: {
    paddingBottom: 8,
  },
  pharmacyItem: {
    alignItems: "center",
    marginRight: 16,
    width: width * 0.2,
  },
  pharmacyImageContainer: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: width * 0.09,
    borderWidth: 1,
    borderColor: "black",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
    backgroundColor: "white",
  },
  pharmacyImage: {
    width: "100%",
    height: "100%",
    aspectRatio: 1,
    resizeMode: "contain",
  },
  pharmacyText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
  },
  pharmacyRating: {
    color: "#606060",
    fontSize: 12,
    marginTop: 4,
  },
  categoryCard: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  categoryIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#606060',
    fontWeight: 'bold',
  },
});
