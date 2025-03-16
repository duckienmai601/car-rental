import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../firebase"; // Import auth và db
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore"; // Thêm deleteDoc và doc
import { Ionicons } from "@expo/vector-icons";

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

const HistoryOrderScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State để kiểm tra trạng thái đăng nhập

  // Hàm tải lại dữ liệu từ Firestore
  const fetchOrders = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setIsLoggedIn(false); // Người dùng chưa đăng nhập
        setOrders([]); // Xóa danh sách đơn hàng
        return;
      }

      setIsLoggedIn(true); // Người dùng đã đăng nhập
      const ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(ordersQuery);
      const ordersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error("Lỗi khi đọc đơn hàng: ", error);
      Alert.alert("Lỗi", error.message || "Không thể tải danh sách đơn hàng. Vui lòng thử lại.");
    }
  };

  // Hàm xử lý làm mới (Pull to Refresh)
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders(); // Gọi lại hàm tải dữ liệu
    setRefreshing(false);
  };

  // Kiểm tra trạng thái đăng nhập khi màn hình được tải
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
        fetchOrders(); // Tải dữ liệu nếu người dùng đã đăng nhập
      } else {
        setIsLoggedIn(false);
        setOrders([]); // Xóa danh sách nếu người dùng đăng xuất
      }
    });

    return () => unsubscribe(); // Hủy đăng ký listener khi component unmount
  }, []);

  const handleViewDetails = (order) => {
    navigation.navigate("OrderDetails", { order });
  };

  const handleCancelOrder = (orderId) => {
    Alert.alert(
      "Xác nhận hủy đơn",
      "Bạn có chắc muốn hủy đơn hàng này không?",
      [
        {
          text: "Không",
          style: "cancel",
        },
        {
          text: "Có",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "orders", orderId));
              setOrders(orders.filter((order) => order.id !== orderId));
              Alert.alert("Thành công", "Đơn hàng đã được hủy.");
            } catch (error) {
              console.error("Lỗi khi hủy đơn hàng: ", error);
              Alert.alert("Lỗi", "Không thể hủy đơn hàng. Vui lòng thử lại.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Lịch sử đơn hàng</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {!isLoggedIn ? (
          <Text style={styles.emptyText}>Người dùng chưa đăng nhập!</Text>
        ) : orders.length === 0 ? (
          <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào.</Text>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.orderItem}>
              <Image
                source={getImage(order.vehicleId)}
                style={styles.vehicleImage}
                resizeMode="contain"
              />
              <View style={styles.orderDetails}>
                <Text style={styles.vehicleTitle}>
                  {order.vehicleMake} {order.vehicleModel}
                </Text>
                <Text style={styles.price}>{order.total.toLocaleString("vi-VN")}đ</Text>
                <Text style={styles.status}>Đã thuê</Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelOrder(order.id)}
                >
                  <Text style={styles.cancelButtonText}>Hủy đơn</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() => handleViewDetails(order)}
                >
                  <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HistoryOrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    paddingTop: 10,
  },
  emptyText: {
    fontSize: 18,
    color: "#757575",
    textAlign: "center",
    marginTop: 40,
    fontWeight: "500",
  },
  orderItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  vehicleImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 15,
  },
  orderDetails: {
    flex: 1,
    justifyContent: "center",
  },
  vehicleTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 5,
  },
  price: {
    fontSize: 18,
    color: "#2E7D32",
    fontWeight: "500",
    marginBottom: 5,
  },
  status: {
    fontSize: 16,
    color: "#D32F2F",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D32F2F",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#D32F2F",
    fontWeight: "500",
  },
  detailButton: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  detailButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
});