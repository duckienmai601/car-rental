import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const OrderDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { order } = route.params; // Lấy dữ liệu đơn hàng từ params

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Chi tiết đơn hàng</Text>
          </View>

          <View style={styles.orderSummary}>
            <Image
              source={
                order.image
                  ? { uri: order.image } // Hiển thị ảnh base64 từ Firestore
                  : require("./assets/rent a car.png") // Ảnh mặc định nếu không có
              }
              style={styles.vehicleImage}
              resizeMode="contain"
            />
            <View style={styles.orderDetails}>
              <Text style={styles.vehicleTitle}>
                {order.vehicleMake} {order.vehicleModel}
              </Text>
              <Text style={styles.price}>
                {formatNumber(order.pricePerDay)}đ x {order.quantity}
              </Text>
            </View>
          </View>

          <View style={styles.addressSection}>
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            <View style={styles.addressItem}>
              <Text style={styles.addressLabel}>Tên:</Text>
              <Text style={styles.addressValue}>{order.fullName}</Text>
            </View>
            <View style={styles.addressItem}>
              <Text style={styles.addressLabel}>Địa chỉ:</Text>
              <Text style={styles.addressValue}>{order.address}</Text>
            </View>
            <View style={styles.addressItem}>
              <Text style={styles.addressLabel}>Số điện thoại:</Text>
              <Text style={styles.addressValue}>{order.phone}</Text>
            </View>
          </View>
          <View style={styles.divider} />

          <View style={styles.rentalPeriodSection}>
            <Text style={styles.sectionTitle}>Thời gian thuê</Text>
            <View style={styles.rentalPeriodContainer}>
              <View style={styles.rentalPeriodRow}>
                <Text style={styles.rentalPeriodLabel}>Từ ngày:</Text>
                <Text style={styles.rentalPeriodValue}>
                  {formatDate(order.fromDate)} - {order.fromTime}
                </Text>
              </View>
              <View style={styles.rentalPeriodRow}>
                <Text style={styles.rentalPeriodLabel}>Đến ngày:</Text>
                <Text style={styles.rentalPeriodValue}>
                  {formatDate(order.toDate)} - {order.toTime}
                </Text>
              </View>
              <View style={styles.rentalPeriodRow}>
                <Text style={styles.rentalPeriodLabel}>Thời gian thuê:</Text>
                <Text style={styles.rentalPeriodValue}>{order.numberOfDays} ngày</Text>
              </View>
            </View>
          </View>
          <View style={styles.divider} />

          <View style={styles.driverSection}>
            <Text style={styles.sectionTitle}>Lựa chọn Tài xế</Text>
            <Text style={styles.driverText}>{order.hasDriver ? "Có" : "Không"}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Số tiền</Text>
              <Text style={styles.priceValue}>{formatNumber(order.subtotal)}đ</Text>
            </View>
            {order.hasDriver && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Phí Tài xế</Text>
                <Text style={styles.priceValue}>{formatNumber(order.driverFee)}đ</Text>
              </View>
            )}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Thuế (10%)</Text>
              <Text style={styles.priceValue}>{formatNumber(order.tax)}đ</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={[styles.priceLabel, styles.totalLabel]}>Tổng cộng:</Text>
              <Text style={[styles.priceValue, styles.totalValue]}>{formatNumber(order.total)}đ</Text>
            </View>
          </View>
          <View style={styles.divider} />

          <View style={styles.paymentMethodSection}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            <View style={styles.paymentMethodRow}>
              <View style={styles.paymentMethodInfo}>
                <Ionicons name="card" size={24} color="black" />
                <Text style={styles.paymentMethodText}>{order.paymentMethod}</Text>
              </View>
            </View>
          </View>
          <View style={styles.divider} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flexGrow: 1 },
  innerContainer: { paddingHorizontal: 30 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  divider: { height: 1, backgroundColor: "black", marginVertical: 20 },
  orderSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  vehicleImage: { width: 80, height: 80, marginRight: 10 },
  orderDetails: { flex: 1 },
  vehicleTitle: { fontSize: 18, fontWeight: "bold" },
  rating: { fontSize: 14, color: "#555" },
  price: { fontSize: 16, color: "#000", fontWeight: "bold" },
  addressSection: { marginBottom: 20 },
  addressItem: { flexDirection: "row", marginBottom: 10 },
  addressLabel: { fontSize: 16, color: "#555", fontWeight: "bold" },
  addressValue: { fontSize: 16, color: "#000", marginLeft: 5 },
  rentalPeriodSection: { marginBottom: 20 },
  rentalPeriodContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
  },
  rentalPeriodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  rentalPeriodLabel: { fontSize: 16, fontWeight: "bold", color: "#C3002F" },
  rentalPeriodValue: { fontSize: 16, color: "#555" },
  driverSection: { marginBottom: 20 },
  driverText: { fontSize: 16, color: "#000" },
  priceBreakdown: { marginBottom: 20 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  totalRow: { borderTopWidth: 1, borderTopColor: "#ccc", paddingTop: 10, marginTop: 10 },
  priceLabel: { fontSize: 16, color: "#555" },
  priceValue: { fontSize: 16, color: "black" },
  totalLabel: { fontSize: 18, fontWeight: "bold", color: "#000" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#000" },
  paymentMethodSection: { marginBottom: 20 },
  paymentMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
  },
  paymentMethodInfo: { flexDirection: "row", alignItems: "center" },
  paymentMethodText: { fontSize: 16, color: "#000", marginLeft: 10 },
  changeButton: { backgroundColor: "#ddd", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5 },
  changeButtonText: { fontSize: 14, color: "#000", fontWeight: "bold" },
});