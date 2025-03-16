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

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  const menuItems = [
    { icon: "notifications-outline", text: "Thông báo" },
    { icon: "person-outline", text: "Chỉnh sửa hồ sơ" },
    { icon: "card-outline", text: "Thanh toán" },
    { icon: "ellipsis-horizontal-circle-outline", text: "Ngôn ngữ & Khu vực" },
  ];

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
          <TouchableOpacity key={index} style={styles.menuItem} onPress={() => Alert.alert(item.text)}>
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
