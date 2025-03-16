import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import data from "./dataset/vehicles.json";
import { auth } from "../firebase";
import { Ionicons } from "@expo/vector-icons"; // Để hiển thị biểu tượng

const image_v_1 = require("./assets/vehicles/v-1.png");
const image_v_2 = require("./assets/vehicles/v-2.png");
const image_v_3 = require("./assets/vehicles/v-3.png");
const image_v_4 = require("./assets/vehicles/v-4.png");

const getImage = (id) => {
  if (id == 1) return image_v_1;
  if (id == 2) return image_v_2;
  if (id == 3) return image_v_3;
  if (id == 4) return image_v_4;
  return require("./assets/rent a car.png");
};

const CheckoutScreen = ({ route }) => {
  const navigation = useNavigation();
  const { vehicleId, fromDate, toDate } = route.params;

  const vehicle = data.vehicles.filter((element) => element.id == vehicleId)[0];

  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [hasDriver, setHasDriver] = useState(false); // Trạng thái chọn tài xế

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Thông báo lỗi: không tìm thấy xe!</Text>
      </SafeAreaView>
    );
  }

  // Tính số ngày thuê
  const startDate = new Date(fromDate);
  const endDate = new Date(toDate);
  const numberOfDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1; // +1 để tính cả ngày đầu và cuối

  // Định dạng ngày tháng theo DD/MM/YYYY
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0"); // +1 vì getMonth() trả về 0-11
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Hàm định dạng số với dấu chấm phân cách hàng nghìn
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Parse price_per_day từ chuỗi thành số
  const pricePerDay = parseFloat(vehicle.price_per_day.replace(/\./g, "")); // Chuyển "800.000" thành 800000

  // Tính toán giá
  const subtotal = pricePerDay * numberOfDays * quantity;
  const driverFee = hasDriver ? 100000 : 0; // Phí tài xế
  const tax = subtotal * 0.1; // Thuế 10% giá xe
  const total = subtotal + driverFee + tax; // Tổng cộng

  const updateQuantity = (value) => {
    setQuantity((prev) => Math.max(1, prev + value));
  };

  const handleConfirm = () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Thông báo", "Bạn phải đăng nhập để đặt hàng", [
        { text: "OK" },
      ]);
      return;
    }

    if (!fullName || !address || !phone) {
      Alert.alert("Thông báo", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    navigation.navigate("PaymentMethod", {
      vehicleId,
      fromDate,
      toDate,
      fullName,
      address,
      phone,
      hasDriver,
      quantity,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerContainer}>
          {/* Header với nút Back */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Thanh toán</Text>
          </View>

          {/* Shipping Address */}
          <View style={styles.addressSection}>
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            <TextInput
              style={styles.input}
              placeholder="Họ và Tên"
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              style={styles.input}
              placeholder="Địa Chỉ"
              value={address}
              onChangeText={setAddress}
            />
            <TextInput
              style={styles.input}
              placeholder="Số Điện Thoại"
              keyboardType="numeric"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
          <View style={styles.divider} />

          {/* Order Details */}
          <View style={styles.orderSection}>
            <Text style={styles.sectionTitle}>Chi tiết đặt hàng</Text>
            <View style={styles.orderItem}>
              <Image source={getImage(vehicle.id)} style={styles.vehicleImage} resizeMode="contain" />
              <View style={styles.details}>
                <Text style={styles.vehicleTitle}>{vehicle.make} {vehicle.model}</Text>
                <Text style={styles.price}>{vehicle.price_per_day}đ /ngày</Text>
                <View style={styles.quantitySection}>
                  <TouchableOpacity onPress={() => updateQuantity(-1)} style={styles.quantityButton}>
                    <Text style={styles.quantityText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{quantity}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(1)} style={styles.quantityButton}>
                    <Text style={styles.quantityText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Rental Period */}
          <View style={styles.rentalPeriodSection}>
            <Text style={styles.sectionTitle}>Thời gian thuê</Text>
            <View style={styles.rentalPeriodContainer}>
              <View style={styles.rentalPeriodRow}>
                <Text style={styles.rentalPeriodLabel}>Từ ngày:</Text>
                <Text style={styles.rentalPeriodValue}>{formatDate(fromDate)}</Text>
              </View>
              <View style={styles.rentalPeriodRow}>
                <Text style={styles.rentalPeriodLabel}>Đến ngày:</Text>
                <Text style={styles.rentalPeriodValue}>{formatDate(toDate)}</Text>
              </View>
              <View style={styles.rentalPeriodRow}>
                <Text style={styles.rentalPeriodLabel}>Thời gian thuê:</Text>
                <Text style={styles.rentalPeriodValue}>{numberOfDays} ngày</Text>
              </View>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Choose Driver */}
          <View style={styles.chooseDriverSection}>
            <Text style={styles.sectionTitle}>Lựa chọn Tài xế</Text>
            <View style={styles.driverOptions}>
              <TouchableOpacity
                style={[styles.driverOption, hasDriver && styles.driverOptionSelected]}
                onPress={() => setHasDriver(true)}
              >
                <Ionicons name="person" size={20} color={hasDriver ? "#C3002F" : "#555"} />
                <Text style={[styles.driverOptionText, hasDriver && styles.driverOptionTextSelected]}>
                  Có
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.driverOption, !hasDriver && styles.driverOptionSelected]}
                onPress={() => setHasDriver(false)}
              >
                <Ionicons name="close" size={20} color={!hasDriver ? "#C3002F" : "#555"} />
                <Text style={[styles.driverOptionText, !hasDriver && styles.driverOptionTextSelected]}>
                  Không
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Price Breakdown */}
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tổng phụ</Text>
              <Text style={styles.priceValue}>{formatNumber(subtotal)}đ</Text>
            </View>
            {hasDriver && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Phí Tài xế</Text>
                <Text style={styles.priceValue}>{formatNumber(driverFee)}đ</Text>
              </View>
            )}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Thuế (10%)</Text>
              <Text style={styles.priceValue}>{formatNumber(tax)}đ</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={[styles.priceLabel, styles.totalLabel]}>Tổng cộng:</Text>
              <Text style={[styles.priceValue, styles.totalValue]}>{formatNumber(total)}đ</Text>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Continue to Payment Button */}
          <TouchableOpacity style={styles.paymentButton} onPress={handleConfirm}>
            <Text style={styles.paymentButtonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    paddingHorizontal: 30,
  },
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

  // Divider (gạch ngang phân cách)
  divider: {
    height: 1,
    backgroundColor: "black",
    marginVertical: 20,
  },

  // Shipping Address
  addressSection: { marginBottom: 20 },
  input: { height: 40, borderColor: "#ccc", borderWidth: 1, borderRadius: 5, paddingLeft: 10, marginBottom: 10 },

  // Order Details
  orderSection: { marginBottom: 20 },
  orderItem: { flexDirection: "row", padding: 10, backgroundColor: "#f9f9f9", borderRadius: 10 },
  vehicleImage: {
    width: 150,
    height: 150,
    marginRight: 15,
  },
  details: { flex: 1, justifyContent: "center" },
  vehicleTitle: { fontSize: 18, fontWeight: "bold" },
  price: { fontSize: 16, color: "#555" },
  quantitySection: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  quantityButton: { width: 30, height: 30, justifyContent: "center", alignItems: "center", backgroundColor: "#ddd", borderRadius: 5 },
  quantityText: { fontSize: 18, fontWeight: "bold" },
  quantity: { fontSize: 16, marginHorizontal: 10 },

  // Rental Period
  rentalPeriodSection: { marginBottom: 20 },
  rentalPeriodContainer: {
    backgroundColor: "#f9f9f9", // Background giống Order Details
    borderRadius: 10,
    padding: 15, // Tăng padding để rộng rãi hơn
  },
  rentalPeriodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10, // Khoảng cách giữa các dòng
  },
  rentalPeriodLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#C3002F", // Màu đỏ đậm để tạo điểm nhấn
  },
  rentalPeriodValue: {
    fontSize: 16,
    color: "#555", // Màu xám giống các giá trị khác
  },

  // Choose Driver
  chooseDriverSection: { marginBottom: 20 },
  driverOptions: { flexDirection: "row", justifyContent: "space-between" },
  driverOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  driverOptionSelected: {
    borderColor: "#C3002F",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  driverOptionText: { fontSize: 16, color: "#555", marginLeft: 8 },
  driverOptionTextSelected: { fontWeight: "bold", color: "#C3002F" },

  // Price Breakdown
  priceBreakdown: { marginBottom: 20 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  totalRow: { borderTopWidth: 1, borderTopColor: "#ccc", paddingTop: 10, marginTop: 10 },
  priceLabel: { fontSize: 16, color: "#555" },
  priceValue: { fontSize: 16, color: "black" },
  totalLabel: { fontSize: 18, fontWeight: "bold", color: "#000" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#000" },

  // Continue to Payment Button
  paymentButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  paymentButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Error Text
  errorText: { fontSize: 18, textAlign: "center", color: "red", marginTop: 50 },
});