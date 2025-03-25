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
import { db, auth } from "../firebase";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

const HistoryOrderScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  const fetchUserId = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setIsLoggedIn(false);
        setUserId(null);
        return null;
      }

      const usersQuery = query(collection(db, "users"), where("email", "==", user.email));
      const usersSnapshot = await getDocs(usersQuery);
      if (!usersSnapshot.empty) {
        const userData = usersSnapshot.docs[0].data();
        setUserId(userData.id);
        return userData.id;
      } else {
        Alert.alert("Lỗi", "Không tìm thấy thông tin user trong hệ thống!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
      Alert.alert("Lỗi", "Không thể lấy thông tin user. Vui lòng thử lại.");
      return null;
    }
  };

  const fetchOrders = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setIsLoggedIn(false);
        setOrders([]);
        return;
      }

      setIsLoggedIn(true);

      const userId = await fetchUserId();
      if (!userId) {
        setOrders([]);
        return;
      }

      const ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", userId)
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
        fetchOrders();
      } else {
        setIsLoggedIn(false);
        setUserId(null);
        setOrders([]);
      }
    });

    return () => unsubscribe();
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
              const orderRef = doc(db, "orders", orderId);
              await deleteDoc(orderRef);
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
                source={
                  order.image
                    ? { uri: order.image }
                    : require("./assets/rent a car.png")
                }
                style={styles.vehicleImage}
                resizeMode="contain"
              />
              <View style={styles.orderDetails}>
                <Text style={styles.vehicleTitle}>
                  {order.vehicleMake} {order.vehicleModel}
                </Text>
                <Text style={styles.price}>{order.total.toLocaleString("vi-VN")}đ</Text>
                <Text style={styles.status}>{order.status}</Text>
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