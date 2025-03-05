import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
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

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {user ? (
          <>
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
          </>
        ) : (
          <>
            <Ionicons name="person-circle-outline" size={80} color="#bbb" />
            <Text style={styles.guestText}>Bạn chưa đăng nhập</Text>
            <TouchableOpacity
              style={styles.buttonLogin}
              onPress={() => navigation.navigate("Login")}
            >
              <Ionicons name="log-in-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Đăng nhập / Đăng ký</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "white",
    width: "85%",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
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
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonLogout: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff3b30",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: "#ff3b30",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "bold",
  },
});
