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
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../firebase";
import { collection, addDoc, doc, getDoc, getDocs, query, where, setDoc, runTransaction } from "firebase/firestore";



const ReviewSummaryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { vehicleId, fromDate, toDate, fromTime, toTime, fullName, address, phone, hasDriver, quantity, paymentMethod } = route.params;

  const [vehicle, setVehicle] = useState(null);
  const [userId, setUserId] = useState(null);
  const [driverId, setDriverId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        if (!vehicleId || typeof vehicleId !== "string") {
          throw new Error("ID xe không hợp lệ.");
        }
        const vehicleRef = doc(db, "vehicles", vehicleId);
        const vehicleSnap = await getDoc(vehicleRef);
        if (vehicleSnap.exists()) {
          setVehicle({ id: vehicleSnap.id, ...vehicleSnap.data() });
        } else {
          Alert.alert("Lỗi", "Không tìm thấy xe!");
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin xe. Vui lòng thử lại.");
      }
    };

    const fetchUserId = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("Người dùng chưa đăng nhập!");
        }

        const usersQuery = query(collection(db, "users"), where("email", "==", user.email));
        const usersSnapshot = await getDocs(usersQuery);
        if (!usersSnapshot.empty) {
          const userData = usersSnapshot.docs[0].data();
          if (!userData.id || typeof userData.id !== "string") {
            throw new Error("ID người dùng không hợp lệ.");
          }
          setUserId(userData.id);
        } 
      } catch (error) {
        Alert.alert("Lỗi", "Không thể lấy thông tin user. Vui lòng thử lại.");
      }
    };

    const fetchDriver = async () => {
      if (!hasDriver) {
        setDriverId(null);
        return;
      }

      try {
        const driversSnapshot = await getDocs(collection(db, "taxiDrivers"));
        const availableDrivers = driversSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((driver) => driver.status === "available");

        if (availableDrivers.length > 0) {
          setDriverId(availableDrivers[0].id);
        } else {
          setDriverId(null);
          Alert.alert("Cảnh báo", "Hiện tại không có tài xế sẵn sàng. Đơn hàng sẽ được tạo mà không có tài xế.");
        }
      } catch (error) {
        console.error("Error fetching driver:", error);
        Alert.alert("Lỗi", "Không thể lấy thông tin tài xế. Vui lòng thử lại.");
        setDriverId(null);
      }
    };

    fetchVehicle();
    fetchUserId();
    fetchDriver();
  }, [vehicleId, hasDriver]);

  if (!vehicle || userId === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingInfoContainer}>
          <Text style={styles.errorText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const startDateTime = new Date(`${fromDate}T${fromTime}:00`);
  const endDateTime = new Date(`${toDate}T${toTime}:00`);
  const timeDiff = endDateTime - startDateTime;
  const numberOfDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

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

  const pricePerDay = vehicle.price_per_day || 0;
  const subtotal = pricePerDay * numberOfDays * quantity;
  const driverFee = hasDriver ? 100000 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + driverFee + tax;

  const getNextOrderId = async () => {
    try {
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      const ids = ordersSnapshot.docs
        .map(doc => parseInt(doc.data().orderId || "0"))
        .filter(id => !isNaN(id));
      if (ids.length === 0) {
        return 1;
      }
      const maxId = Math.max(...ids);
      return maxId + 1;
    } catch (error) {
      console.error("Lỗi khi lấy orderId tiếp theo:", error);
      throw error;
    }
  };

  
  const handleContinue = async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      const orderId = await getNextOrderId();
      const allPlates = vehicle.license_plates ? Object.keys(vehicle.license_plates) : [];

      // Dùng transaction để đảm bảo không trùng biển số
      await runTransaction(db, async (transaction) => {
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        const unavailablePlates = new Set();
  
        ordersSnapshot.docs.forEach((doc) => {
          const order = doc.data();
          if (
            order.vehicleId === vehicleId &&
            !(new Date(toDate) < new Date(order.fromDate) || new Date(fromDate) > new Date(order.toDate))
          ) {
            if (order.plateNumber && typeof order.plateNumber === "object") {
              Object.keys(order.plateNumber).forEach((plate) => {
                unavailablePlates.add(plate);
              });
            }
          }
        });
        
        const availablePlates = allPlates.filter((plate) => !unavailablePlates.has(plate));
        if (availablePlates.length < quantity) {
          throw new Error("Không đủ biển số khả dụng cho đơn hàng này.");
        }
        const selectedPlates = availablePlates.slice(0, quantity);
        const selectedPlateObject = {};
        selectedPlates.forEach(plate => {
          selectedPlateObject[plate] = true;
        });
  
        const orderData = {
          userId,
          vehicleId,
          vehicleMake: vehicle.make || "N/A",
          vehicleModel: vehicle.model || "N/A",
          image: vehicle.image || "",
          plateNumber: selectedPlateObject,
          pricePerDay: vehicle.price_per_day || 0,
          fromDate,
          toDate,
          fromTime,
          toTime,
          numberOfDays,
          fullName,
          address,
          phone,
          hasDriver,
          driverId: hasDriver ? driverId : null,
          quantity,
          paymentMethod,
          subtotal,
          driverFee,
          tax,
          total,
          orderDate: new Date().toISOString(),
          status: "Chờ xác thực",
          orderId: orderId.toString(),
        };
  
        const orderRef = doc(collection(db, "orders"));
        transaction.set(orderRef, orderData);
        // Trừ số lượng xe khả dụng sau khi tạo đơn hàng
          const vehicleRef = doc(db, "vehicles", vehicleId);
          const currentAvailable = vehicle.available_quantity || 0;
          const newAvailable = currentAvailable - selectedPlates.length;

          if (newAvailable < 0) {
            throw new Error("Không đủ số lượng xe khả dụng.");
          }

          transaction.update(vehicleRef, { available_quantity: newAvailable });

      });
  
      navigation.navigate("OrderSuccessful", { orderId: orderId.toString() });
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      Alert.alert("Lỗi", error.message || "Không thể lưu đơn hàng. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };
  
  

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#C3002F" />
            <Text style={styles.loadingText}>Đang xử lý...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Tóm tắt đơn hàng</Text>
          </View>

          <View style={styles.orderSummary}>
            <Image
              source={{ uri: vehicle.image || "https://via.placeholder.com/80" }}
              style={styles.vehicleImage}
              resizeMode="contain"
            />
            <View style={styles.orderDetails}>
              <Text style={styles.vehicleTitle}>
                {vehicle.make || "N/A"} {vehicle.model || "N/A"}
              </Text>
              <Text style={styles.price}>
                {formatNumber(pricePerDay)}đ x {quantity}
              </Text>
            </View>
          </View>

          <View style={styles.addressSection}>
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            <View style={styles.addressItem}>
              <Text style={styles.addressLabel}>Tên:</Text>
              <Text style={styles.addressValue}>{fullName || "N/A"}</Text>
            </View>
            <View style={styles.addressItem}>
              <Text style={styles.addressLabel}>Địa chỉ:</Text>
              <Text style={styles.addressValue}>{address || "N/A"}</Text>
            </View>
            <View style={styles.addressItem}>
              <Text style={styles.addressLabel}>Số điện thoại:</Text>
              <Text style={styles.addressValue}>{phone || "N/A"}</Text>
            </View>


          </View>
          <View style={styles.divider} />
          
          <View style={styles.rentalPeriodSection}>
            <Text style={styles.sectionTitle}>Thời gian thuê</Text>
            <View style={styles.rentalPeriodContainer}>
              <View style={styles.rentalPeriodRow}>
                <Text style={styles.rentalPeriodLabel}>Từ ngày:</Text>
                <Text style={styles.rentalPeriodValue}>
                  {formatDate(fromDate)} - {fromTime}
                </Text>
              </View>
              <View style={styles.rentalPeriodRow}>
                <Text style={styles.rentalPeriodLabel}>Đến ngày:</Text>
                <Text style={styles.rentalPeriodValue}>
                  {formatDate(toDate)} - {toTime}
                </Text>
              </View>
              <View style={styles.rentalPeriodRow}>
                <Text style={styles.rentalPeriodLabel}>Thời gian thuê:</Text>
                <Text style={styles.rentalPeriodValue}>{numberOfDays} ngày</Text>
              </View>
            </View>
          </View>
          <View style={styles.divider} />
          
          <View style={styles.driverSection}>
            <Text style={styles.sectionTitle}>Lựa chọn Tài xế</Text>
            <Text style={styles.driverText}>{hasDriver ? "Có" : "Không"}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Số tiền</Text>
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

          <View style={styles.paymentMethodSection}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            <View style={styles.paymentMethodRow}>
              <View style={styles.paymentMethodInfo}>
                <Ionicons name="card" size={24} color="black" />
                <Text style={styles.paymentMethodText}>{paymentMethod || "N/A"}</Text>
              </View>
            </View>
          </View>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.paymentButton} onPress={handleContinue} disabled={isLoading}>
            <Text style={styles.paymentButtonText}>Đặt Xe</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff",
  },
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
  paymentButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  paymentButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  // Cập nhật style cho thông báo "Đang tải thông tin..."
  loadingInfoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: { 
    fontSize: 20, // Tăng kích thước chữ
    fontWeight: "600", // Chữ đậm vừa phải
    color: "#C3002F", // Màu đỏ để đồng bộ với giao diện
    textAlign: "center", // Căn giữa văn bản
    fontStyle: "italic", // Chữ nghiêng để tạo điểm nhấn
  },
  // Style cho màn hình loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  loadingBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});

export default ReviewSummaryScreen;