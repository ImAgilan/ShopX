module.exports = {
  ROLES: {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    CUSTOMER: 'customer',
  },
  ORDER_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  },
  PAYMENT_METHODS: {
    PAYHERE: 'payhere',
    COD: 'cod',
    BANK: 'bank',
  },
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },
  CURRENCIES: {
    LKR: { code: 'LKR', symbol: 'Rs.', rate: 1 },
    USD: { code: 'USD', symbol: '$', rate: 0.0031 },
  },
  LAYOUT_SECTIONS: [
    'hero',
    'categories',
    'featured_products',
    'upcoming_products',
    'promotional_banner',
    'footer',
  ],
};
