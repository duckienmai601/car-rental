import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { Ionicons } from "@expo/vector-icons";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Hàm tạo id tăng dần cho collection "users"
  const getNextId = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const ids = querySnapshot.docs
        .map(doc => parseInt(doc.data().id))
        .filter(id => !isNaN(id));
      if (ids.length === 0) {
        return "1";
      }
      const maxId = Math.max(...ids);
      return (maxId + 1).toString();
    } catch (error) {
      console.error("Lỗi khi lấy ID tiếp theo:", error);
      throw error;
    }
  };

  const handleLogin = async () => {
    try {
      // Đăng nhập user với Firebase Authentication
      await signInWithEmailAndPassword(auth, email, password);

      // Kiểm tra xem user đã tồn tại trong collection "users" hay chưa (dựa trên email)
      const userQuery = query(collection(db, "users"), where("email", "==", email));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        // Nếu user chưa tồn tại trong "users", tạo document mới
        const newUserId = await getNextId();

        // Lưu thông tin user vào collection "users"
        await addDoc(collection(db, "users"), {
          id: newUserId,
          email: email,
          password: password, // Cảnh báo: Lưu mật khẩu dạng plaintext không an toàn
          role: "normal", // Thêm trường role với giá trị mặc định là "normal"
        });
      }

      // Điều hướng đến màn hình Home
      navigation.replace("Home");
    } catch (error) {
      console.error("Đăng nhập thất bại:", error);
      Alert.alert("Đăng nhập thất bại", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Ionicons name="person-circle-outline" size={60} color="black" style={styles.icon} />
      <Text style={styles.title}>Đăng Nhập</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="black" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="black" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.linkText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng Nhập</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "black",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    marginBottom: 15,
    marginTop: 15,
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
});