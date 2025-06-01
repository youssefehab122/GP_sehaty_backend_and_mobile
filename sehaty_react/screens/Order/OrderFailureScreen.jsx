import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

const OrderFailureScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { error, orderData, paymentMethod } = route.params || {};

  const handleRetry = () => {
    // For Paymob failures, we might want to try a different payment method
    if (paymentMethod === 'paymob') {
      Alert.alert(
        "Try Different Payment Method",
        "Would you like to try a different payment method?",
        [
          {
            text: "Change Method",
            onPress: () => navigation.navigate("PaymentScreen", {
              ...orderData,
              initialMethod: 'cash' // Default to cash on retry
            })
          },
          {
            text: "Try Paymob Again",
            onPress: () => navigation.navigate("PaymentScreen", orderData)
          },
          { text: "Cancel", style: "cancel" }
        ]
      );
    } else {
      navigation.navigate("PaymentScreen", orderData);
    }
  };

  const handleGoToCart = () => {
    navigation.navigate("CartScreen");
  };

  const handleContactSupport = () => {
    navigation.navigate("Support", {
      presetMessage: `I encountered an error with my order: ${error || 'Payment failed'}`,
    });
  };

  // Special case for Paymob failures
  const isPaymobError = paymentMethod === 'paymob';
  const errorTitle = isPaymobError ? 'Payment Processing Failed' : 'Order Failed';
  const primaryErrorMessage = isPaymobError 
    ? 'There was an issue processing your card payment. Please try again or use a different payment method.'
    : error || "We couldn't process your order. Please try again.";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Error Header */}
        <View style={styles.errorHeader}>
          <View style={styles.errorIconContainer}>
            <MaterialIcons name="error-outline" size={80} color="#E53935" />
          </View>
          <Text style={styles.errorTitle}>{errorTitle}</Text>
          <Text style={styles.errorMessage}>
            {primaryErrorMessage}
          </Text>
        </View>

        {/* Error Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What went wrong?</Text>
          <View style={styles.detailsCard}>
            {isPaymobError ? (
              <>
                <View style={styles.detailItem}>
                  <MaterialIcons name="payment" size={24} color="#E53935" />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailTitle}>Payment Declined</Text>
                    <Text style={styles.detailDescription}>
                      Your card may have been declined by your bank. Please check your card details or try a different payment method.
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <MaterialIcons name="credit-card" size={24} color="#E53935" />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailTitle}>Card Issues</Text>
                    <Text style={styles.detailDescription}>
                      Ensure your card is valid, has sufficient funds, and supports online payments.
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.detailItem}>
                  <MaterialIcons name="payment" size={24} color="#E53935" />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailTitle}>Payment Processing Error</Text>
                    <Text style={styles.detailDescription}>
                      There was an issue processing your payment. This could be due to insufficient funds or a temporary service disruption.
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <MaterialIcons name="network-check" size={24} color="#E53935" />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailTitle}>Connection Issues</Text>
                    <Text style={styles.detailDescription}>
                      Please check your internet connection and ensure it's stable before trying again.
                    </Text>
                  </View>
                </View>
              </>
            )}

            <View style={styles.detailItem}>
              <MaterialIcons name="info-outline" size={24} color="#E53935" />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailTitle}>Need Help?</Text>
                <Text style={styles.detailDescription}>
                  If the problem persists, please contact our support team for assistance.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.retryButton]}
            onPress={handleRetry}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>
              {isPaymobError ? 'Try Different Method' : 'Try Again'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.cartButton]}
            onPress={handleGoToCart}
          >
            <Ionicons name="cart-outline" size={20} color="#1B794B" />
            <Text style={[styles.actionButtonText, styles.cartButtonText]}>
              Back to Cart
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.supportButton]}
            onPress={handleContactSupport}
          >
            <MaterialIcons name="support-agent" size={20} color="#1B794B" />
            <Text style={[styles.actionButtonText, styles.supportButtonText]}>
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContainer: {
    padding: 16,
  },
  errorHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  errorIconContainer: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E53935",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: "#606060",
    textAlign: "center",
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  detailTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  detailDescription: {
    fontSize: 14,
    color: "#606060",
    lineHeight: 20,
  },
  actionButtons: {
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#E53935",
  },
  cartButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#1B794B",
  },
  supportButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#1B794B",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
    color: "#fff",
  },
  cartButtonText: {
    color: "#1B794B",
  },
  supportButtonText: {
    color: "#1B794B",
  },
});

export default OrderFailureScreen;
