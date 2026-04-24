import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Modal, Alert, RefreshControl, Image,
} from 'react-native';
import { rtdb } from '../config/firebase';
import { ref, push, onValue, serverTimestamp } from 'firebase/database';

// Import Product Images
import imgTomatoes from '../../assets/produce/tomatoes.png';
import imgPotatoes from '../../assets/produce/potatoes.png';
import imgChillies from '../../assets/produce/chillies.png';
import imgWheat from '../../assets/produce/wheat.png';
import imgHoney from '../../assets/produce/honey.png';
import imgRice from '../../assets/produce/rice.png';
import imgSpinach from '../../assets/produce/spinach.png';
import imgCorn from '../../assets/produce/corn.png';

const { width } = Dimensions.get('window');

// Products stored locally — these will also be seeded to RTDB
const LOCAL_PRODUCTS = [
  { name: 'Organic Tomatoes',  price: 40,   unit: 'kg',      seller: 'Ramesh K.',    category: 'Vegetables', image: imgTomatoes, description: 'Fresh organic tomatoes from Punjab farm.' },
  { name: 'Fresh Potatoes',    price: 25,   unit: 'kg',      seller: 'Suresh M.',    category: 'Vegetables', image: imgPotatoes, description: 'Locally grown potatoes harvested this week.' },
  { name: 'Green Chillies',    price: 15,   unit: '250g',    seller: 'Anita D.',     category: 'Vegetables', image: imgChillies, description: 'Spicy green chillies, direct from farm.' },
  { name: 'Premium Wheat',     price: 2200, unit: 'quintal', seller: 'FarmCo Ops',   category: 'Grains',     image: imgWheat,    description: 'Grade-A wheat with low moisture content.' },
  { name: 'Local Honey',       price: 450,  unit: '500g',    seller: 'BeeKeepers',   category: 'Dairy',      image: imgHoney,    description: 'Pure raw honey from Himalayan bees.' },
  { name: 'Basmati Rice',      price: 95,   unit: 'kg',      seller: 'Doon Valley',  category: 'Grains',     image: imgRice,     description: 'Premium long-grain aged basmati.' },
  { name: 'Fresh Spinach',     price: 20,   unit: '500g',    seller: 'Green Farms',  category: 'Vegetables', image: imgSpinach,  description: 'Pesticide-free baby spinach leaves.' },
  { name: 'Sweet Corn',        price: 30,   unit: 'piece',   seller: 'Vikram S.',    category: 'Vegetables', image: imgCorn,     description: 'Sweet golden corn, freshly harvested.' },
];

const IMAGE_MAP = {
  'Organic Tomatoes': imgTomatoes,
  'Fresh Potatoes': imgPotatoes,
  'Green Chillies': imgChillies,
  'Premium Wheat': imgWheat,
  'Local Honey': imgHoney,
  'Basmati Rice': imgRice,
  'Fresh Spinach': imgSpinach,
  'Sweet Corn': imgCorn,
};

const CATEGORIES = ['All', 'Vegetables', 'Grains', 'Dairy'];
const CARD_COLORS = ['#fef9c3', '#dcfce7', '#fce7f3', '#e0f2fe', '#fff7ed', '#f0fdf4', '#fdf2f8', '#fefce8'];

function ProductCard({ item, index, onAdd }) {
  return (
    <View style={styles.productCard}>
      <View style={[styles.imageBox, { backgroundColor: CARD_COLORS[index % CARD_COLORS.length] }]}>
        <Image source={IMAGE_MAP[item.name] || item.image} style={styles.productImage} resizeMode="contain" />
        <View style={styles.catTag}>
          <Text style={styles.catTagText}>{item.category}</Text>
        </View>
      </View>
      <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.productSeller}>by {item.seller}</Text>
      <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.productPrice}>
          Rs.{item.price}<Text style={styles.productUnit}>/{item.unit}</Text>
        </Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(item)}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ShopScreen() {
  const [products, setProducts] = useState(LOCAL_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [firebaseOk, setFirebaseOk] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  // Try loading products from Firebase RTDB on mount
  useEffect(() => {
    try {
      const productsRef = ref(rtdb, 'products');
      onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const fromFB = Object.entries(data).map(([key, val]) => ({ id: key, ...val }));
          setProducts(fromFB);
          setFirebaseOk(true);
        } else {
          // Seed products to RTDB if empty
          seedProducts();
        }
      }, (err) => {
        console.log('RTDB products read error:', err.message);
        // Keep local products — app still works
      });

      // Listen to order count
      const ordersRef = ref(rtdb, 'orders');
      onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setOrderCount(Object.keys(data).length);
          setFirebaseOk(true);
        }
      }, () => {});
    } catch (err) {
      console.log('Firebase init error:', err.message);
    }
  }, []);

  const seedProducts = async () => {
    try {
      const productsRef = ref(rtdb, 'products');
      for (const p of LOCAL_PRODUCTS) {
        await push(productsRef, p);
      }
      setFirebaseOk(true);
      console.log('Products seeded to RTDB!');
    } catch (err) {
      console.log('Seed error:', err.message);
    }
  };

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.name === item.name);
      if (existing) return prev.map(c => c.name === item.name ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
    Alert.alert('Added!', `${item.name} added to cart`);
  };

  const removeFromCart = (name) => setCart(prev => prev.filter(c => c.name !== name));

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleCheckout = async () => {
    // Build order object
    const order = {
      items: cart.map(item => ({
        name: item.name,
        price: item.price,
        qty: item.qty,
        seller: item.seller,
        subtotal: item.price * item.qty,
      })),
      totalAmount: totalPrice,
      totalItems: totalItems,
      status: 'placed',
      orderDate: new Date().toISOString(),
    };

    // Push to Firebase RTDB
    try {
      const ordersRef = ref(rtdb, 'orders');
      await push(ordersRef, order);
      console.log('ORDER PUSHED TO FIREBASE RTDB!');
      setFirebaseOk(true);
    } catch (err) {
      console.log('Order push error:', err.message);
      Alert.alert(
        'Firebase Rules Required',
        'Go to Firebase Console > Realtime Database > Rules and set:\n\n{ "rules": { ".read": true, ".write": true } }\n\nThen try again.',
      );
    }

    setPaymentSuccess(true);
    setCart([]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>AgroShop</Text>
          <Text style={styles.headerSub}>
            {firebaseOk ? 'CONNECTED TO FIREBASE' : 'LOCAL MODE'} | {orderCount} orders placed
          </Text>
        </View>
        <TouchableOpacity style={styles.cartIconBtn} onPress={() => setShowCart(true)}>
          <Text style={styles.cartIconText}>Cart</Text>
          {totalItems > 0 && (
            <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{totalItems}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.catChip, activeCategory === c && styles.catChipActive]}
              onPress={() => setActiveCategory(c)}
            >
              <Text style={[styles.catChipText, activeCategory === c && styles.catChipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.productCount}>{filteredProducts.length} products available</Text>

        {/* Product Grid */}
        <View style={styles.grid}>
          {filteredProducts.map((item, i) => (
            <ProductCard key={item.name + i} item={item} index={i} onAdd={addToCart} />
          ))}
        </View>
      </ScrollView>

      {/* Cart Modal */}
      <Modal visible={showCart} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.cartModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cart ({totalItems} items)</Text>
              <TouchableOpacity onPress={() => setShowCart(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <Text style={styles.emptyText}>YOUR CART IS EMPTY</Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 350 }}>
                {cart.map(item => (
                  <View key={item.name} style={styles.cartItem}>
                    <Image source={IMAGE_MAP[item.name] || item.image} style={styles.cartItemImage} resizeMode="contain" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={{ color: '#64748b', fontSize: 11 }}>Qty: {item.qty} x Rs.{item.price}</Text>
                    </View>
                    <Text style={styles.cartItemPrice}>Rs.{item.price * item.qty}</Text>
                    <TouchableOpacity onPress={() => removeFromCart(item.name)} style={{ marginLeft: 10 }}>
                      <Text style={{ color: '#ef4444', fontSize: 20, fontWeight: '700' }}>x</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            <View style={styles.cartFooter}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>Rs.{totalPrice}</Text>
              </View>
              <TouchableOpacity
                style={[styles.checkoutBtn, cart.length === 0 && { backgroundColor: '#cbd5e1' }]}
                disabled={cart.length === 0}
                onPress={handleCheckout}
              >
                <Text style={styles.checkoutBtnText}>
                  Place Order - Rs.{totalPrice}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Success */}
      <Modal visible={paymentSuccess} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}><Text style={styles.successIconText}>SUCCESS</Text></View>
            <Text style={styles.successTitle}>Order Placed!</Text>
            <Text style={styles.successDesc}>
              {firebaseOk
                ? 'Your order has been saved to Firebase Realtime Database. Check your Firebase Console to see it!'
                : 'Order saved locally. Set Firebase RTDB rules to Test Mode to sync.'}
            </Text>
            <TouchableOpacity style={styles.finishBtn} onPress={() => { setPaymentSuccess(false); setShowCart(false); }}>
              <Text style={styles.finishBtnText}>Back to Shop</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingTop: 52, backgroundColor: '#0d2b18',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 9, color: '#86efac', letterSpacing: 0.5, fontWeight: '600', marginTop: 2 },
  cartIconBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#1a3a22', position: 'relative',
  },
  cartIconText: { color: '#86efac', fontSize: 13, fontWeight: '700' },
  cartBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#ef4444', borderRadius: 10, width: 20, height: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  catRow: { marginVertical: 14 },
  catChip: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20,
    backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0',
  },
  catChipActive: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  catChipText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  catChipTextActive: { color: '#fff', fontWeight: '700' },
  productCount: { fontSize: 11, color: '#94a3b8', paddingHorizontal: 16, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  productCard: {
    width: (width - 48) / 2, backgroundColor: '#fff',
    borderRadius: 18, padding: 12, margin: 6,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 },
  },
  imageBox: {
    width: '100%', height: 95, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10, position: 'relative',
  },
  productImage: { width: '80%', height: '80%' },
  catTag: {
    position: 'absolute', bottom: 5, right: 5,
    backgroundColor: 'rgba(255,255,255,0.88)', borderRadius: 7, paddingHorizontal: 6, paddingVertical: 2,
  },
  catTagText: { fontSize: 9, color: '#475569', fontWeight: '700' },
  productName: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  productSeller: { fontSize: 10, color: '#22C55E', marginTop: 2, fontWeight: '600' },
  productDesc: { fontSize: 10, color: '#94a3b8', marginTop: 4, lineHeight: 14 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  productPrice: { fontSize: 15, fontWeight: '800', color: '#16a34a' },
  productUnit: { fontSize: 10, color: '#64748b', fontWeight: '400' },
  addBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#0d2b18', alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 20, fontWeight: '600', lineHeight: 28 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  cartModal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  closeText: { fontSize: 13, color: '#ef4444', fontWeight: '600' },
  emptyCart: { paddingVertical: 40, alignItems: 'center', gap: 10 },
  emptyText: { color: '#0f172a', fontSize: 16, fontWeight: '700' },
  cartItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  cartItemImage: { width: 40, height: 40, borderRadius: 8 },
  cartItemName: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  cartItemPrice: { fontSize: 14, fontWeight: '800', color: '#22C55E' },
  cartFooter: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  totalLabel: { fontSize: 15, color: '#64748b', fontWeight: '600' },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#22C55E' },
  checkoutBtn: { backgroundColor: '#16a34a', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  checkoutBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  successCard: { backgroundColor: '#fff', margin: 32, borderRadius: 24, padding: 30, alignItems: 'center' },
  successIcon: {backgroundColor:'#dcfce7', paddingHorizontal:12, paddingVertical:6, borderRadius:8, marginBottom:16},
  successIconText: {color:'#15803d', fontSize:10, fontWeight:'800'},
  successTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginTop: 12, marginBottom: 8 },
  successDesc: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  finishBtn: { backgroundColor: '#0d2b18', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12 },
  finishBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
