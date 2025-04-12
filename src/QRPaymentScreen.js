import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker"; // Import Image Picker

const QRPaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { vehicleId, fromDate, toDate, fromTime, toTime, fullName, address, phone, hasDriver, quantity, paymentMethod, total } = route.params;

  const [paymentProofImage, setPaymentProofImage] = useState(null); // State để lưu ảnh xác nhận thanh toán

  // Hàm chọn ảnh từ thư viện
  const pickImage = async () => {
    // Yêu cầu quyền truy cập thư viện ảnh
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Thông báo", "Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh!");
      return;
    }

    // Mở Image Picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPaymentProofImage(result.assets[0].uri); // Lưu URI của ảnh đã chọn
    }
  };

  // Hàm định dạng số với dấu chấm phân cách hàng nghìn
  const formatNumber = (number) => {
    if (number === undefined || number === null) {
      return "0"; // Trả về giá trị mặc định nếu number không tồn tại
    }
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleContinue = () => {
    if (!paymentProofImage) {
      Alert.alert("Thông báo", "Vui lòng tải lên ảnh xác nhận thanh toán!");
      return;
    }

    // Chuyển đến ReviewSummaryScreen và truyền thêm paymentProofImage
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
      paymentProofImage,
      total, // Truyền thêm total (nếu cần ở ReviewSummaryScreen)
    });
  };

  // Kiểm tra nếu total không tồn tại, hiển thị thông báo hoặc giá trị mặc định
  if (total === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lỗi: Không thể lấy thông tin số tiền. Vui lòng quay lại và thử lại.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerContainer}>
          {/* Header với nút Back */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Thanh toán bằng QR Code</Text>
          </View>

          {/* Thông tin QR Code */}
          <View style={styles.qrSection}>
            <Text style={styles.sectionTitle}>Quét mã QR để thanh toán</Text>
            {/* Thêm hình ảnh QR Code tĩnh */}
            <Image
              source={require("../src/assets/qr.jpg")} // Đảm bảo file qr.jpg đã có trong thư mục assets
              style={styles.qrImage}
              resizeMode="contain"
            />
            <View style={styles.qrInfoContainer}>
              <Text style={styles.qrInfo}>Số tài khoản: 123456789</Text>
              <Text style={styles.qrInfo}>Ngân hàng: Â Châu (ACB)</Text>
              <Text style={styles.qrInfo}>Chủ tài khoản: Ha Quoc Bao</Text>
              <Text style={styles.qrInfo}>Nội dung: Tên-Địa Chỉ-Số điện thoại</Text>
              <Text style={styles.qrInfo}>Số tiền: {formatNumber(total)} VND</Text>
              <Text style={styles.qrNote}>* Nạp tiền xong và sau khi Đặt xe thì đợi ít phút để hệ thống xác thực</Text>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Tải lên ảnh xác nhận thanh toán */}
          <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>Tải lên ảnh xác nhận thanh toán</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={24} color="white" />
              <Text style={styles.uploadButtonText}>Chọn ảnh</Text>
            </TouchableOpacity>
            {paymentProofImage && (
              <Image
                source={{ uri: paymentProofImage }}
                style={styles.uploadedImage}
                resizeMode="contain"
              />
            )}
          </View>
          <View style={styles.divider} />

          {/* Nút Tiếp tục */}
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flexGrow: 1 },
  innerContainer: { paddingHorizontal: 30 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  divider: { height: 1, backgroundColor: "black", marginVertical: 20 },
  qrSection: { marginBottom: 20, alignItems: "center" }, // Căn giữa để hình ảnh và thông tin trông cân đối
  qrImage: { width: 200, height: 200, marginBottom: 10 }, // Kích thước hình ảnh QR Code
  qrInfoContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    width: "100%", // Đảm bảo container thông tin chiếm toàn bộ chiều rộng
  },
  qrInfo: { fontSize: 16, color: "#000", marginBottom: 5 },
  qrNote: { fontSize: 14, color: "red", marginTop: 5 },
  uploadSection: { marginBottom: 20 },
  uploadButton: {
    flexDirection: "row",
    backgroundColor: "#C3002F",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButtonText: { color: "white", fontSize: 16, fontWeight: "bold", marginLeft: 10 },
  uploadedImage: { width: "100%", height: 200, marginTop: 10, borderRadius: 10 },
  continueButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  continueButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#C3002F",
    padding: 10,
    borderRadius: 10,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default QRPaymentScreen;