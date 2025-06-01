import axios from 'axios';
import crypto from 'crypto'; // You forgot to import this
import Order from '../models/OrderModel.js';
import { config } from '../config/config.js';

class PaymobService {
  constructor() {
    this.apiKey = config.paymob.apiKey;
    this.iframeId = config.paymob.iframeId;
    this.integrationId = config.paymob.integrationId;
    this.hmacSecret = config.paymob.hmacSecret;
    this.baseUrl = "https://accept.paymobsolutions.com/api";
  }
 async registerWebhook() {
    try {
      const token = await this.authenticate();
      const response = await axios.post(`${this.baseUrl}/acceptance/webhooks`, {
        auth_token: token,
        url: `${config.server.baseUrl}/api/orders/paymob/callback`,
      });
      return response.data;
    } catch (error) {
      console.error("Webhook registration error:", error.response?.data || error.message);
      throw error;
    }
  }

  async processCallback(payload) {
    try {
      if (!payload || !payload.obj) {
        throw new Error("Invalid payload format");
      }

      const { obj } = payload;
      
      // Validate HMAC if provided
      if (obj.hmac) {
        if (!this.validateHMAC(obj.hmac, obj)) {
          throw new Error("Invalid HMAC signature");
        }
      }

      const order = await Order.findById(obj.merchant_order_id);
      if (!order) {
        throw new Error("Order not found");
      }

      return {
        success: obj.success === "true",
        orderId: obj.merchant_order_id,
        transactionId: obj.id,
        amount: obj.amount_cents / 100,
        payload: obj
      };
    } catch (error) {
      console.error("Callback processing error:", error);
      throw error;
    }
  }
  async getPaymentUrl(orderId, amountCents, billingData, returnUrl) {
    try {
      const { paymentKey, paymobOrderId } = await this.getPaymentKey(
        orderId,
        amountCents,
        billingData,
        returnUrl
      );

      return {
        paymentUrl: `https://accept.paymobsolutions.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`,
        paymobOrderId,
        paymentKey,
      };
    } catch (error) {
      console.error("Payment URL generation error:", error);
      throw error;
    }
  }

  async authenticate() {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/tokens`, {
        api_key: this.apiKey,
      });
      return response.data.token;
    } catch (error) {
      console.error("Paymob authentication error:", error.response?.data || error.message);
      throw error;
    }
  }

  async createOrder(orderId, amountCents) {
    try {
      const token = await this.authenticate();
      const response = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
        auth_token: token,
        delivery_needed: "false",
        amount_cents: amountCents.toString(),
        currency: "EGP",
        merchant_order_id: orderId.toString(),
        items: [],
      });
      return response.data;
    } catch (error) {
      console.error("Paymob order creation error:", error.response?.data || error.message);
      throw error;
    }
  }

  async getPaymentKey(orderId, amountCents, billingData, returnUrl) {
    try {
      const token = await this.authenticate();
      const { id: paymobOrderId } = await this.createOrder(orderId, amountCents);

      // Ensure returnUrl is properly formatted
      const formattedReturnUrl = returnUrl.startsWith('http') 
        ? returnUrl 
        : `${config.server.baseUrl}/api/payment/paymob/callback`;

      const response = await axios.post(`${this.baseUrl}/acceptance/payment_keys`, {
        auth_token: token,
        amount_cents: amountCents.toString(),
        expiration: 3600,
        order_id: paymobOrderId.toString(),
        billing_data: billingData,
        currency: "EGP",
        integration_id: this.integrationId,
        return_url: formattedReturnUrl
      });

      return {
        paymentKey: response.data.token,
        paymobOrderId,
      };
    } catch (error) {
      console.error("Paymob payment key error:", error.response?.data || error.message);
      throw error;
    }
  }

  async verifyPayment(transactionId) {
    try {
      const token = await this.authenticate();
      const response = await axios.get(
        `${this.baseUrl}/acceptance/transactions/${transactionId}/verify`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Paymob payment verification error:", error.response?.data || error.message);
      throw error;
    }
  }

  validateHMAC(hmac, obj) {
    try {
      // For redirection callback, we need to handle the data differently
      const entries = Object.entries(obj)
        .filter(([k]) => k !== 'hmac') // Remove hmac from calculation
        .sort(([a], [b]) => a.localeCompare(b));

      // Create concatenated string with key=value format
      const concatenated = entries.map(([k, v]) => `${k}=${v}`).join('');

      // Calculate HMAC using SHA512
      const calculatedHmac = crypto
        .createHmac('sha512', this.hmacSecret)
        .update(concatenated)
        .digest('hex');

      console.log('HMAC Validation:', {
        received: hmac,
        calculated: calculatedHmac,
        data: concatenated,
        secret: this.hmacSecret
      });

      return hmac === calculatedHmac;
    } catch (error) {
      console.error('HMAC validation error:', error);
      return false;
    }
  }

  validateRedirectionHMAC(hmac, query) {
    try {
      // Define the required keys in the correct order
      const requiredKeys = [
        'PLAINTEXT',
        'amount_cents',
        'created_at',
        'currency',
        'error_occured',
        'has_parent_transaction',
        'id',
        'integration_id',
        'is_3d_secure',
        'is_auth',
        'is_capture',
        'is_refunded',
        'is_standalone_payment',
        'is_voided',
        'order',
        'owner',
        'pending',
        'source_data.pan',
        'source_data.sub_type',
        'source_data.type',
        'success'
      ];

      // Create concatenated string with values in the required order
      const concatenated = requiredKeys
        .map(key => {
          if (key === 'PLAINTEXT') return 'PLAINTEXT';
          if (key.includes('.')) {
            const [parent, child] = key.split('.');
            return query[parent]?.[child] || '';
          }
          return query[key] || '';
        })
        .join('');

      // Calculate HMAC
      const calculatedHmac = crypto
        .createHmac('sha512', this.hmacSecret)
        .update(concatenated)
        .digest('hex');

      console.log('Redirection HMAC Validation:', {
        received: hmac,
        calculated: calculatedHmac,
        data: concatenated,
        secret: this.hmacSecret
      });

      return hmac === calculatedHmac;
    } catch (error) {
      console.error('Redirection HMAC validation error:', error);
      return false;
    }
  }
}

const paymobService = new PaymobService();
export default paymobService;
