import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useDispatch } from "react-redux";
import { addAddress } from "../../store/slices/addressSlice";
import { useNavigation, useRoute } from "@react-navigation/native";
import { PROVIDER_GOOGLE } from "react-native-maps";

// Custom marker image (optional)
import CustomPin from "../../assets/custom-pin.png"; // replace with your pin image

export default function ChooseAddressScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [addressTitle, setAddressTitle] = useState("My Address");
  const [isLoading, setIsLoading] = useState(false);
  const [region, setRegion] = useState({
    latitude: 30.033333,
    longitude: 31.233334,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Get the callback from route params if it exists
  const shouldUseCallback = route.params?.useCallback === true;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please enable location permissions to use this feature"
        );
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setSelectedLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        await reverseGeocode(
          location.coords.latitude,
          location.coords.longitude
        );
      } catch (error) {
        console.error("Error getting location:", error);
      }
    })();
  }, []);

  const reverseGeocode = async (latitude, longitude) => {
    try {
      console.log("[ChooseAddress] Starting reverse geocoding for:", {
        latitude,
        longitude,
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            "User-Agent": "MedicineFinder/1.0 (test@gmail.com)", // <-- Add this line
          },
        }
      );
      const data = await response.json();
      console.log(
        "[ChooseAddress] Raw geocoding response:",
        JSON.stringify(data, null, 2)
      );

      if (data && data.display_name) {
        // Log each address component
        console.log("[ChooseAddress] Address components:", {
          road: data.address?.road,
          suburb: data.address?.suburb,
          city: data.address?.city,
          state: data.address?.state,
          country: data.address?.country,
        });

        // Split the address into components and filter out undefined/empty values
        const addressParts = [
          data.address?.road,
          data.address?.suburb,
          data.address?.city,
          data.address?.state,
          data.address?.country,
        ].filter(Boolean);

        console.log("[ChooseAddress] Filtered address parts:", addressParts);

        const formattedAddress = addressParts.join(", ");
        console.log(
          "[ChooseAddress] Final formatted address:",
          formattedAddress
        );

        setLocationName(formattedAddress || "Address not found");

        // Set a meaningful title if not already set
        if (!addressTitle) {
          const title =
            data.address?.road || data.address?.suburb || "My Address";
          console.log("[ChooseAddress] Setting new title:", title);
          setAddressTitle(title);
        }
      } else {
        console.log("[ChooseAddress] No address data found in response");
        setLocationName("Address not found");
      }
    } catch (error) {
      console.error("[ChooseAddress] Error in reverse geocoding:", error);
      setLocationName("Error getting address");
    }
  };

  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    await reverseGeocode(latitude, longitude);
  };

  const handleSaveAddress = async () => {
    try {
      console.log("[ChooseAddress] Starting save address process");
      console.log("[ChooseAddress] Current state:", {
        selectedLocation,
        locationName,
        addressTitle,
      });

      if (!selectedLocation) {
        console.log("[ChooseAddress] No location selected");
        Alert.alert("Error", "Please select a location on the map");
        return;
      }

      if (!locationName || locationName === "Address not found") {
        console.log("[ChooseAddress] Invalid location name:", locationName);
        Alert.alert("Error", "Please wait for the address to be loaded");
        return;
      }

      const addressData = {
        title: addressTitle || "My Address",
        address: locationName,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      };

      console.log(
        "[ChooseAddress] Prepared address data:",
        JSON.stringify(addressData, null, 2)
      );

      if (shouldUseCallback) {
        console.log("[ChooseAddress] Using callback navigation");
        const returnScreen = route.params?.returnScreen;
        const fromScreen = route.params?.fromScreen;
        const originalRoute = route.params?.originalRoute;
        
        if (returnScreen && fromScreen === 'AddressListScreen') {
          // If we came from AddressListScreen, navigate back to it with the original route
          navigation.navigate(returnScreen, {
            newAddress: addressData,
            timestamp: Date.now(),
            originalRoute: originalRoute // Pass along the original route
          });
        } else {
          // For other cases, just go back
          navigation.goBack();
        }
      } else {
        console.log("[ChooseAddress] Dispatching to Redux");
        const result = await dispatch(addAddress(addressData)).unwrap();
        console.log("[ChooseAddress] Redux dispatch result:", result);
        navigation.goBack();
      }
    } catch (error) {
      console.error("[ChooseAddress] Error saving address:", error);
      Alert.alert("Error", "Failed to save address. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#606060" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Location</Text>
        <View style={styles.backButton} />
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          onPress={handleMapPress}
          region={region}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={true}
          followsUserLocation={true}
        >
          {selectedLocation && (
            <Marker coordinate={selectedLocation}>
              <Image
                source={CustomPin}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </Marker>
          )}
        </MapView>
      </View>

      {/* Address Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.inputContainer}>
          <MaterialIcons name="location-on" size={24} color="#1B794B" />
          <TextInput
            style={styles.addressInput}
            value={locationName}
            placeholder="Address will appear here"
            editable={false}
            multiline
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="title" size={24} color="#1B794B" />
          <TextInput
            style={styles.titleInput}
            value={addressTitle}
            onChangeText={setAddressTitle}
            placeholder="Address title (e.g., Home, Work)"
            maxLength={30}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveAddress}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Address</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#E8F5E9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B794B",
    textAlign: "center",
    flex: 1,
  },
  backButton: {
    width: 40,
    alignItems: "center",
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 8,
  },
  addressInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
    minHeight: 60,
    textAlignVertical: "top",
  },
  titleInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#1B794B",
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
