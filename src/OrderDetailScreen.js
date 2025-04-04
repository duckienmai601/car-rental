import React, { useState, useEffect } from "react";
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
import { db } from "../firebase";
import { doc, getDoc,collection } from "firebase/firestore";
import Rating from "./Rating"; // Đường dẫn tùy theo bạn lưu file ở đâu

const OrderDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { order } = route.params; // Lấy dữ liệu đơn hàng từ params
  const [driver, setDriver] = useState(null); // State để lưu thông tin tài xế

  // Lấy thông tin tài xế từ Firestore dựa trên driverId nếu hasDriver là true
  useEffect(() => {
    const fetchDriver = async () => {
      try {
        if (order?.hasDriver && order?.driverId) {
          const driverRef = doc(db, "taxiDrivers", order.driverId);
          const driverSnap = await getDoc(driverRef);
          if (driverSnap.exists()) {
            setDriver(driverSnap.data()); // Lưu thông tin tài xế (name, phone)
          } else {
            console.warn("Tài xế không tồn tại:", order.driverId);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin tài xế:", error);
      }
    };

    fetchDriver();
  }, [order?.hasDriver, order?.driverId]);

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
                order?.image
                  ? { uri: order.image } // Hiển thị ảnh base64 từ Firestore
                  : require("./assets/rent a car.png") // Ảnh mặc định nếu không có
              }
              style={styles.vehicleImage}
              resizeMode="contain"
            />
            <View style={styles.orderDetails}>
              <Text style={styles.vehicleTitle}>
                {order?.vehicleMake} {order?.vehicleModel}
              </Text>
              <Text style={styles.price}>
                {formatNumber(order?.pricePerDay || 0)}đ x {order?.quantity || 0}
              </Text>
            </View>
          </View>

          <View style={styles.addressSection}>
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            <View style={styles.addressItem}>
              <Text style={styles.addressLabel}>Tên:</Text>
              <Text style={styles.addressValue}>{order?.fullName || "N/A"}</Text>
            </View>
            <View style={styles.addressItem}>
              <Text style={styles.addressLabel}>Địa chỉ:</Text>
              <Text style={styles.addressValue}>{order?.address || "N/A"}</Text>
            </View>
            <View style={styles.addressItem}>
              <Text style={styles.addressLabel}>Số điện thoại:</Text>
              <Text style={styles.addressValue}>{order?.phone || "N/A"}</Text>
            </View>
          </View>
          <View style={styles.divider} />

          <View style={styles.rentalPeriodSection}>
            <Text style={styles.sectionTitle}>Thời gian thuê</Text>
            <View style={styles.rentalPeriodContainer}>
              <View style={styles.rentalPeriodRow}>
                <Text style={styles.rentalPeriodLabel}>Từ ngày:</Text>
                <Text style={styles.rentalPeriodValue}>
                  {order?.fromDate ? formatDate(order.fromDate) : "N/A"} - {order?.fromTime || "N/A"}
                </Text>
              </View>
              <View style={styles.rentalPeriodRow}>
                <Text style={styles.rentalPeriodLabel}>Đến ngày:</Text>
                <Text style={styles.rentalPeriodValue}>
                  {order?.toDate ? formatDate(order.toDate) : "N/A"} - {order?.toTime || "N/A"}
                </Text>
              </View>
              <View style={styles.rentalPeriodRow}>
                <Text style={styles.rentalPeriodLabel}>Thời gian thuê:</Text>
                <Text style={styles.rentalPeriodValue}>{order?.numberOfDays || 0} ngày</Text>
              </View>
            </View>
          </View>
          <View style={styles.divider} />

                    <View style={styles.driverSection}>
            <Text style={styles.sectionTitle}>Lựa chọn Tài xế</Text>
            <View style={styles.driverCard}>
              {order?.hasDriver && order?.driverId && driver ? (
                <View style={styles.driverInfo}>
                  <View style={styles.driverStatusRow}>
                    <Ionicons name="checkmark-circle" size={20} color="#28a745" style={styles.driverIcon} />
                    <Text style={[styles.driverText, styles.driverStatus, { color: "#28a745" }]}>Có</Text>
                  </View>
                  <View style={styles.driverDetailRow}>
                    <Ionicons name="person" size={18} color="#555" style={styles.driverDetailIcon} />
                    <Text style={styles.driverDetailText}>Tên Tài Xế: {driver.name}</Text>
                  </View>
                  <View style={styles.driverDetailRow}>
                    <Ionicons name="call" size={18} color="#555" style={styles.driverDetailIcon} />
                    <Text style={styles.driverDetailText}>Số Điện Thoại: {driver.phone}</Text>
                  </View>
                </View>
              ) : order?.hasDriver ? (
                <View style={styles.driverInfo}>
                  <View style={styles.driverStatusRow}>
                    <Ionicons name="warning" size={20} color="#f1c40f" style={styles.driverIcon} />
                    <Text style={[styles.driverText, styles.driverStatus, { color: "#f1c40f" }]}>
                      Hiện đã hết tài xế
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.driverInfo}>
                  <View style={styles.driverStatusRow}>
                    <Ionicons name="close-circle" size={20} color="#dc3545" style={styles.driverIcon} />
                    <Text style={[styles.driverText, styles.driverStatus, { color: "#dc3545" }]}>Không</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
          <View style={styles.divider} />

          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Số tiền</Text>
              <Text style={styles.priceValue}>{formatNumber(order?.subtotal || 0)}đ</Text>
            </View>
            {order?.hasDriver && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Phí Tài xế</Text>
                <Text style={styles.priceValue}>{formatNumber(order?.driverFee || 0)}đ</Text>
              </View>
            )}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Thuế (10%)</Text>
              <Text style={styles.priceValue}>{formatNumber(order?.tax || 0)}đ</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={[styles.priceLabel, styles.totalLabel]}>Tổng cộng:</Text>
              <Text style={[styles.priceValue, styles.totalValue]}>{formatNumber(order?.total || 0)}đ</Text>
            </View>
          </View>
          <View style={styles.divider} />

          <View style={styles.paymentMethodSection}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            <View style={styles.paymentMethodRow}>
              <View style={styles.paymentMethodInfo}>
                <Ionicons name="card" size={24} color="black" />
                <Text style={styles.paymentMethodText}>{order?.paymentMethod || "N/A"}</Text>
              </View>
            </View>
          </View>
          <View style={styles.divider} />
          {order?.status?.trim().toLowerCase() === "hoàn thành" && (
            <View style={{ padding: 16, alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>
                🎉 Đơn hàng đã hoàn thành – Đánh giá trải nghiệm của bạn
              </Text>
              <Rating vehicleId={order?.vehicleId} orderStatus={order?.status} />

            </View>
          )}
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
  driverCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  driverInfo: {
    flexDirection: "column",
  },
  driverStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  driverIcon: {
    marginRight: 8,
  },
  driverStatus: {
    fontSize: 16,
    fontWeight: "bold",
  },
  driverDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  driverDetailIcon: {
    marginRight: 8,
  },
  driverDetailText: {
    fontSize: 14,
    color: "#333",
  },
  driverText: { fontSize: 16, color: "#000", marginBottom: 5 },
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

