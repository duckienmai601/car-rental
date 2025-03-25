import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native"; // Đảm bảo import useRoute
import { Ionicons } from "@expo/vector-icons"; // Để hiển thị biểu tượng

const PaymentMethodScreen = () => {
  const navigation = useNavigation();
  const route = useRoute(); // Sử dụng useRoute để lấy params
  const [selectedMethod, setSelectedMethod] = useState(null); // Trạng thái để theo dõi phương thức thanh toán được chọn

  const paymentMethods = [
    { id: "cash", name: "Tiền mặt", icon: "cash-outline" },
    { id: "QR Code", name: "Mã QR", icon: "chatbubble-ellipses-outline" },
  ];

  const handleSelectMethod = (methodId) => {
    setSelectedMethod(methodId);
  };

  const handleContinue = () => {
    if (!selectedMethod) {
      Alert.alert("Thông báo", "Vui lòng chọn phương thức thanh toán");
      return;
    }

    // Lấy tất cả thông tin từ params và thêm paymentMethod
    const { vehicleId, fromDate, toDate,fromTime,toTime, fullName, address, phone, hasDriver, quantity } = route.params;
    const paymentMethod = paymentMethods.find((method) => method.id === selectedMethod).name;

    navigation.navigate("ReviewSummary", {
      vehicleId,
      fromDate,
      toDate,
      fromTime,
      toTime,
      fullName,
      address,
      phone,
      hasDriver,
      quantity,
      paymentMethod,
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
            <Text style={styles.headerText}>Phương thức thanh toán</Text>
          </View>

          {/* Mô tả */}
          <Text style={styles.description}>Chọn phương thức thanh toán bạn muốn sử dụng.</Text>

          {/* Danh sách phương thức thanh toán */}
          <View style={styles.paymentSection}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodItem,
                  selectedMethod === method.id && styles.methodItemSelected,
                ]}
                onPress={() => handleSelectMethod(method.id)}
              >
                <View style={styles.methodInfo}>
                  <Ionicons name={method.icon} size={24} color="black" style={styles.methodIcon} />
                  <Text style={styles.methodName}>{method.name}</Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    selectedMethod === method.id && styles.radioCircleSelected,
                  ]}
                >
                  {selectedMethod === method.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.divider} />

          {/* Nút Continue */}
          <TouchableOpacity style={styles.paymentButton} onPress={handleContinue}>
            <Text style={styles.paymentButtonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentMethodScreen;

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
  description: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  paymentSection: {
    marginBottom: 20,
  },
  methodItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 10,
  },
  methodItemSelected: {
    borderColor: "#C3002F",
    borderWidth: 1,
  },
  methodInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  methodIcon: {
    marginRight: 8,
  },
  methodName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleSelected: {
    borderColor: "#C3002F",
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#C3002F",
  },
  divider: {
    height: 1,
    backgroundColor: "black",
    marginVertical: 20,
  },
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
});