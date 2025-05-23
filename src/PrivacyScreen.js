import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // Import icon back

const PrivacyScreen = ({ route }) => {
  const navigation = useNavigation();
  const { vehicleId } = route.params; // Nhận vehicleId từ InfoScreen

  return (
    <View style={styles.container}>
      {/* Header chứa nút Back và tiêu đề */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Chính Sách Bảo Mật & Điều Khoản Thuê Xe</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Giới Thiệu</Text>
          <Text style={styles.text}>
            Chào mừng bạn đến với dịch vụ thuê xe của chúng tôi. Trước khi sử dụng dịch vụ, vui lòng đọc kỹ chính sách bảo mật và điều khoản dưới đây.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Thông Tin Cá Nhân</Text>
          <Text style={styles.text}>
            Chúng tôi thu thập thông tin cá nhân của bạn để đảm bảo quá trình thuê xe được thực hiện một cách thuận lợi và an toàn.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Điều Kiện Thuê Xe</Text>
          <Text style={styles.text}>
            - Người thuê phải từ 21 tuổi trở lên.
            {'\n'}- Có giấy phép lái xe hợp lệ ít nhất 1 năm.
            {'\n'}- Cung cấp giấy tờ tùy thân hợp lệ (CMND/CCCD hoặc Hộ chiếu).
            {'\n'}- Thanh toán tiền đặt cọc theo quy định.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Trách Nhiệm Của Người Thuê</Text>
          <Text style={styles.text}>
            - Sử dụng xe đúng mục đích và không vi phạm pháp luật.
            {'\n'}- Giữ gìn vệ sinh và bảo quản xe trong suốt quá trình thuê.
            {'\n'}- Thông báo ngay nếu xảy ra sự cố hoặc tai nạn.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Bảo Hiểm & Bồi Thường</Text>
          <Text style={styles.text}>
            - Xe được bảo hiểm nhưng không bao gồm các trường hợp vi phạm hợp đồng thuê xe.
            {'\n'}- Người thuê chịu trách nhiệm cho mọi thiệt hại do lỗi cá nhân gây ra.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Chính Sách Hủy & Hoàn Tiền</Text>
          <Text style={styles.text}>
            - Hủy đơn đặt xe sẽ bị mất tiền cọc và chúng tôi không hoàn lại.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Liên Hệ</Text>
          <Text style={styles.text}>
            Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ chúng tôi qua email: support@thuexe.com hoặc hotline: 0123-456-789.
          </Text>
        </View>
      </ScrollView>

      {/* Button Continue */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("RentDay", { vehicleId })}>
        <Text style={styles.buttonText}>Tiếp tục</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PrivacyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  // Thêm style cho header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginTop: 40, // Khoảng trống nhỏ ở đầu trang
  },
  backButton: {
    marginRight: 15, // Khoảng cách giữa nút Back và tiêu đề
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    flex: 1, // Để tiêu đề chiếm toàn bộ không gian còn lại
    textAlign: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20, // Giảm paddingVertical để tránh khoảng trống quá lớn
  },
  section: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#000",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: "#000",
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});