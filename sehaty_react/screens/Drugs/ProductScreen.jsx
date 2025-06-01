import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";
import { addToWishlist, removeFromWishlist, fetchWishlist } from "../../store/slices/wishlistSlice";
import { addToCart } from "../../store/slices/cartSlice";
import { productsAPI } from "../../services/api";
import {
  Ionicons,
  Feather,
  AntDesign,
  MaterialIcons,
} from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function ProductScreen({ route, navigation }) {
  const { product } = route.params;
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.wishlist);
  useEffect(() => {
    fetchData();
    dispatch(fetchWishlist());
  }, [dispatch, product._id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const alternatives = await productsAPI.getAlternatives(product._id);
      setRelatedProducts(alternatives);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Check if an item is in the wishlist
  const isInWishlist = (id) => {
    return items.some(item => item._id === id);
  };

  // Toggle wishlist status
  const toggleFavorite = (item) => {
    if (isInWishlist(item._id)) {
      dispatch(removeFromWishlist(item._id));
    } else {
      dispatch(addToWishlist(item));
    }
  };

  const handleShare = () => {
    // Placeholder for share functionality
    alert("Share functionality coming soon!");
  };

  const handleSearch = () => {
    navigation.navigate("Search");
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsHorizontalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.sliderOuterWrap}>
            <View style={styles.headerButtonsRow}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.headerIconBtn}
              >
                <Ionicons name="arrow-back" size={24} color="#606060" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSearch}
                style={styles.headerIconBtn}
              >
                <Feather name="search" size={24} color="#606060" />
              </TouchableOpacity>
            </View>
            <View style={styles.sliderCard}>
              <Carousel
                width={width * 0.7}
                height={200}
                data={product.images || [product.image]}
                autoPlay
                loop
                scrollAnimationDuration={1000}
                onSnapToItem={(index) => setCarouselIndex(index)}
                renderItem={({ item }) => (
                  <View style={styles.sliderImageWrapCentered}>
                    <Image
                      source={{ uri: item }}
                      style={styles.sliderImageCentered}
                      resizeMode="contain"
                    />
                  </View>
                )}
              />
              <View style={styles.dotsContainer}>
                {(product.images || [product.image]).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      carouselIndex === i
                        ? styles.activeDot
                        : styles.inactiveDot,
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentSection}>
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {product.name}
                </Text>
              </View>
              <View style={styles.iconColumn}>
                <TouchableOpacity
                  onPress={() => toggleFavorite(product)}
                  style={styles.iconBtn}
                >
                  <AntDesign
                    name={isInWishlist(product._id) ? "heart" : "hearto"}
                    size={22}
                    color={isInWishlist(product._id) ? "#E53935" : "#1B794B"}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
                  <Feather name="share-2" size={22} color="#1B794B" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.price}>EGP {product.price}</Text>
              {product.originalPrice && (
                <Text style={styles.oldPrice}>EGP {product.originalPrice}</Text>
              )}
            </View>
            <Text style={styles.description}>
              {product.description}
            </Text>
          </View>
          {relatedProducts && relatedProducts.length > 0 ? (
            <>
              <View style={styles.relatedHeaderRow}>
                <Text style={styles.relatedTitle}>Alternative Medicines</Text>
                <TouchableOpacity onPress={() => navigation.navigate("DrugAlternative", { product })}>
                  <Text style={styles.viewAll}>View all</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.relatedScroll}
              >
                {relatedProducts.map((item) => (
                  <TouchableOpacity 
                    key={item._id} 
                    style={styles.relatedCard}
                    onPress={() => navigation.navigate("Product", { product: item })}
                  >
                    <TouchableOpacity
                      style={styles.relatedHeartBtn}
                      onPress={() => toggleFavorite(item)}
                    >
                      <AntDesign
                        name={isInWishlist(item._id) ? "heart" : "hearto"}
                        size={18}
                        color={isInWishlist(item._id) ? "#E53935" : "#1B794B"}
                      />
                    </TouchableOpacity>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.relatedImage}
                      resizeMode="cover"
                    />
                    <Text style={styles.relatedName}>{item.name}</Text>
                    <Text style={styles.relatedPrice}>EGP {item.price}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : null}
        </ScrollView>
        <View style={{ height: 90 }} />

        <View style={styles.addToCartButtonWrap}>
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={() => {
              // console.log("product ==> ", JSON.stringify(product,null,2));
              let cartItem = {
                medicineId: product._id,
                pharmacyId: product.pharmacyInfo.pharmacyId,
                quantity:1
              }
              dispatch(addToCart({
                ...cartItem,
                quantity: 1
              }));
              navigation.navigate("Cart");
            }}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: {
    paddingBottom: 30,
    paddingTop: 30,
    backgroundColor: "#fff",
  },
  headerContainer: {
    backgroundColor: "#E8F5E9",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 30,
    paddingTop: 30,
    marginBottom: 0,
    position: "relative", // ADD THIS
  },
  headerButtonsRow: {
    position: "absolute", // ADD THIS
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10, // optional but helps layering
  },
  headerIconBtn: {
    // backgroundColor: "#fff",
    // borderRadius: 20,
    // padding: 6,
    // elevation: 2,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.08,
    // shadowRadius: 2,
    color: "#606060",
  },
  sliderOuterWrap: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 0,
  },
  sliderCard: {
    alignItems: "center",
    justifyContent: "center",
  },
  sliderImageWrapCentered: {
    width: width * 0.7,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    overflow: "hidden", // optional: hides overflow
  },

  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 4 },
  activeDot: { backgroundColor: "#606060" },
  inactiveDot: { backgroundColor: "#D6D6D6" },
  contentSection: {
    marginHorizontal: 16,
    marginTop: -24,
    padding: 18,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: -15,
  },
  relatedScroll: {
    padding: 18,
  },
  iconColumn: {
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: 8,
  },
  iconBtn: {
    marginBottom: 8,
    borderRadius: 16,
    padding: 4,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B794B",
    flexShrink: 1,
  },
  priceRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B794B",
    marginRight: 12,
  },
  oldPrice: {
    fontSize: 16,
    color: "#888",
    fontWeight: "bold",
    textDecorationLine: "line-through",
  },
  description: { fontSize: 14, color: "#606060", marginTop: 8 },
  relatedHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sliderImageCentered: {
    width: "100%",
    height: "100%",
    resizeMode: "contain", // ensures full image is shown without cropping
  },

  relatedTitle: { fontSize: 16, fontWeight: "bold", color: "#1B794B" },
  viewAll: { fontSize: 14, color: "#1B794B", fontWeight: "500" },

  relatedCard: {
    width: 150,
    height: 220,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 14,
    padding: 10,
    position: "relative",
  },
  relatedHeartBtn: {
    padding: 2,
    alignItems: "flex-end",
  },
  relatedImage: { borderRadius: 8, width: 110, height: 100,resizeMode:"contain"},
  relatedName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
  relatedPrice: {
    fontSize: 12,
    color: "#1B794B",
    marginTop: 2,
    textAlign: "center",
  },
  addToCartButtonWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    paddingBottom: 12,
    alignItems: "center",
  },
  addToCartButton: {
    backgroundColor: "#1B794B",
    paddingVertical: 18,
    borderRadius: 12,
    width: width - 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
