import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const NotifyScreen = () => {
  const navigation = useNavigation();

  // Dữ liệu thông báo tĩnh (dịch sang tiếng Việt)
  const notifications = [
    
    {
      icon: "cube-outline",
      title: "Xác nhận đơn hàng",
      description: "Chúc mừng! Đơn hàng của bạn đã được đặt thành công. Nhấn để xem chi tiết.",
      time: "1 năm trước",
    },
    {
      icon: "chatbubble-outline",
      title: "Thông báo sản phẩm mới",
      description: "Tin tức thú vị! Chúng tôi đã thêm sản phẩm mới vào bộ sưu tập. Nhấn để khám phá.",
      time: "1 năm trước",
    },
    {
      icon: "pricetag-outline",
      title: "Ưu đãi giảm giá độc quyền",
      description: "Nhận 20% giảm giá cho lần mua sắm tiếp theo! Ưu đãi có hạn. Nhấn để xem chi tiết.",
      time: "1 năm trước",
    },
    {
      icon: "chatbubble-outline",
      title: "Tính năng mới khả dụng",
      description: "Khám phá tính năng mới nhất của chúng tôi để nâng cao trải nghiệm mua sắm. Nhấn để tìm hiểu thêm.",
      time: "11 tháng trước",
    },
    {
      icon: "cube-outline",
      title: "Phương thức thanh toán đã liên kết",
      description: "Phương thức thanh toán của bạn đã được liên kết thành công với tài khoản.",
      time: "1 năm trước",
    },
    {
      icon: "pricetag-outline",
      title: "Giảm giá đặc biệt cho bạn",
      description: "Chúng tôi đã tạo ra một mã giảm giá đặc biệt cho bạn. Nhấn để nhận mã.",
      time: "1 năm trước",
    },
    {
      icon: "cube-outline",
      title: "Đơn hàng đã được giao",
      description: "Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã mua sắm với chúng tôi.",
      time: "1 năm trước",
    },
    {
      icon: "chatbubble-outline",
      title: "Khảo sát khách hàng",
      description: "Chúng tôi muốn nghe ý kiến của bạn! Nhấn để tham gia khảo sát.",
      time: "1 năm trước",
    },
  ];

  const handleClearAll = () => {
    // Logic để xóa tất cả thông báo (hiện tại chỉ hiển thị thông báo)
    alert("Đã xóa tất cả thông báo!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.recentText}>Gần đây</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.map((notification, index) => (
          <TouchableOpacity key={index} style={styles.notificationItem}>
            <Ionicons
              name={notification.icon}
              size={24}
              color="#555"
              style={styles.notificationIcon}
            />
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationDescription}>
                {notification.description}
              </Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotifyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333333",
  },
  clearAllText: {
    fontSize: 16,
    color: "#007AFF",
  },
  recentSection: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  recentText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
  },
  notificationIcon: {
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 5,
  },
  notificationDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999999",
  },
});