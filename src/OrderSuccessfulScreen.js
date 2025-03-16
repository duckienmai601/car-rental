import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // Để hiển thị biểu tượng dấu tích và home

const OrderSuccessfulScreen = () => {
  const navigation = useNavigation();

  const handleViewOrder = () => {
    // Điều hướng đến màn hình chi tiết đơn hàng (giả định là "OrderDetails")
    navigation.navigate("Saved");
  };

  const handleGoHome = () => {
    // Điều hướng về màn hình Home
    navigation.navigate("Home");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoHome}>
          <Ionicons name="home" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.innerContainer}>
        {/* Icon dấu tích xanh */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color="#000" />
        </View>

        {/* Tiêu đề và mô tả */}
        <Text style={styles.title}>Đặt hàng thành công!</Text>
        <Text style={styles.description}>Bạn đã đặt hàng thành công.</Text>

        {/* Nút View Order */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleViewOrder}>
          <Text style={styles.primaryButtonText}>Xem đơn hàng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OrderSuccessfulScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: "black",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});