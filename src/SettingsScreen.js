import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

const SettingsScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    // Hiển thị thông báo xác nhận
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có muốn đăng xuất không?",
      [
        {
          text: "Không",
          style: "cancel", // Hủy hành động
        },
        {
          text: "Có",
          onPress: async () => {
            try {
              await signOut(auth);
              Alert.alert("Thành công", "Bạn đã đăng xuất thành công!");
            } catch (error) {
              console.error("Lỗi đăng xuất:", error);
              Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.");
            }
          },
        },
      ],
      { cancelable: false } // Không cho phép nhấn ngoài để thoát Alert
    );
  };

  const menuItems = [
    { icon: "notifications-outline", text: "Thông báo" },
    { icon: "help-circle-outline", text: "Trợ giúp" },
    { icon: "shield-checkmark-outline", text: "Điều khoản & Quyền riêng tư" },
    { icon: "star-outline", text: "Đánh giá ứng dụng" },
    { icon: "information-circle-outline", text: "Giới thiệu" },
  ];

  // Hàm xử lý khi nhấn vào menu item
  const handleMenuItemPress = (itemText) => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!user) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để xem thông tin này",
        [
          {
            text: "ok",
            style: "cancel",
          },
          
        ],
        { cancelable: false }
      );
      return;
    }

    // Nếu đã đăng nhập, hiển thị thông tin tương ứng với từng mục
    switch (itemText) {
      case "Thông báo":
        navigation.navigate("Notify");
        break;
      case "Trợ giúp":
        Alert.alert(
          "Trợ giúp",
          "Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua:\n- Email: support@rentacar.com\n- Hotline: 1900 1234\n- Thời gian làm việc: 8:00 - 17:00, Thứ 2 - Thứ 7"
        );
        break;
      case "Điều khoản & Quyền riêng tư":
        Alert.alert(
          "Điều khoản & Quyền riêng tư",
          "Chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Vui lòng xem chi tiết tại trang web của chúng tôi."
        );
        break;
      case "Đánh giá ứng dụng":
        Alert.alert(
          "Đánh giá ứng dụng",
          "Cảm ơn bạn đã sử dụng ứng dụng của chúng tôi! Vui lòng đánh giá ứng dụng trên cửa hàng ứng dụng để giúp chúng tôi cải thiện dịch vụ."
        );
        break;
      case "Giới thiệu":
        Alert.alert(
          "Giới thiệu",
          "Chúng tôi là dịch vụ thuê xe hàng đầu, cung cấp các loại xe đa dạng từ xe du lịch, xe gia đình đến xe sang trọng. Với đội ngũ tài xế chuyên nghiệp và dịch vụ hỗ trợ 24/7, chúng tôi cam kết mang đến cho bạn trải nghiệm thuê xe an toàn, tiện lợi và thoải mái nhất. Hãy đồng hành cùng chúng tôi trên mọi hành trình!"
        );
        break;
      default:
        Alert.alert(itemText, "Chức năng này đang được phát triển.");
    }
  };

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: user.photoURL
                ? user.photoURL
                : "https://cdn-icons-png.flaticon.com/512/3177/3177440.png",
            }}
            style={styles.avatar}
          />
          <Text style={styles.welcomeText}>Xin chào, {user.email}!</Text>
          <TouchableOpacity style={styles.buttonLogout} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.userInfo}>
          <Ionicons name="person-circle-outline" size={80} color="#bbb" />
          <Text style={styles.guestText}>Bạn chưa đăng nhập</Text>
          <TouchableOpacity
            style={styles.buttonLogin}
            onPress={() => navigation.navigate("Login")}
          >
            <Ionicons name="log-in-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Đăng nhập / Đăng ký</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => handleMenuItemPress(item.text)}
          >
            <Ionicons name={item.icon} size={24} color="black" style={styles.menuIcon} />
            <Text style={styles.menuText}>{item.text}</Text>
            <Ionicons name="chevron-forward" size={24} color="black" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    paddingTop: 20,
  },
  userInfo: {
    backgroundColor: "white",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingTop: 120,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  guestText: {
    fontSize: 16,
    color: "#777",
    marginBottom: 15,
  },
  buttonLogin: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
  },
  buttonLogout: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff3b30",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "bold",
  },
  menuContainer: {
    width: "100%",
    backgroundColor: "white",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
});