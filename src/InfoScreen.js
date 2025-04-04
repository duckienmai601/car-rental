import React, { useState, useEffect } from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../firebase";
import { db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Alert } from "react-native";
import Rating from "./Rating";
// Import biểu tượng tĩnh
const back = require("./assets/icons/left-arrow.png");

const InfoScreen = ({ route, navigation }) => {
  const [vehicle, setVehicle] = useState(null);
  const [orderStatus, setOrderStatus] = useState(""); // Lưu trạng thái đơn hàng
  const [userRatings, setUserRatings] = useState([]); // Lưu thông tin đánh giá của người dùng
  const [averageRating, setAverageRating] = useState(null);
  const user = auth.currentUser;

  // Hàm lấy ảnh dựa trên base64 string
  const getImage = (imageData) => {
    if (typeof imageData === "string" && imageData.startsWith("data:image")) {
      return { uri: imageData };
    } else {
      return require("./assets/icons/compass-active.png");
    }
  };

  // Hàm định dạng số tiền
  const formatNumber = (number) => {
    const numStr = number.toString().replace(/[^0-9]/g, "");
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Lấy dữ liệu xe từ Firestore dựa trên id
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!route.params || !route.params.id) {
        Alert.alert("Lỗi", "Không tìm thấy ID xe. Vui lòng thử lại.");
        navigation.goBack();
        return;
      }

      try {
        const vehicleRef = doc(db, "vehicles", route.params.id.toString());
        const vehicleSnap = await getDoc(vehicleRef);

        if (vehicleSnap.exists()) {
          const data = vehicleSnap.data();
          const ratings = data.ratings || [];

          // Tính trung bình rating
          let avg = null;
          if (ratings.length > 0) {
            const total = ratings.reduce((sum, r) => sum + (r.rating || 0), 0);
            avg = total / ratings.length;
          }

          // Lấy tên người dùng từ Firebase
          const userRatingsData = await Promise.all(
            ratings.map(async (rating) => {
              const userRef = doc(db, "users", rating.userId);
              const userSnap = await getDoc(userRef);
              const userData = userSnap.exists() ? userSnap.data() : {};
              return { name: userData.email, rating: rating.rating };
            })
          );

          setVehicle({ id: vehicleSnap.id, ...data });
          setAverageRating(avg); // cập nhật số sao trung bình
          setUserRatings(userRatingsData); // lưu thông tin đánh giá
        } else {
          Alert.alert("Lỗi", "Không tìm thấy thông tin xe.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ Firestore:", error);
        Alert.alert("Lỗi", "Không thể lấy thông tin xe: " + error.message);
        navigation.goBack();
      }
    };

    fetchVehicle();
  }, [route.params, navigation]);

  // Nếu vehicle chưa được tải, hiển thị loading
  if (!vehicle) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.9}
          >
            <Image
              source={back}
              resizeMode="contain"
              style={styles.menuIconStyle}
            />
          </TouchableOpacity>
          <Text style={styles.HeaderText}>Chi tiết</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.imageSection}>
          <Image
            source={getImage(vehicle.image)}
            resizeMode="contain"
            style={styles.vehicleImage}
          />
        </View>

        <View style={styles.headSection}>
          <View style={styles.topTextArea}>
            <Text style={styles.makemodelText}>
              {vehicle.make} {vehicle.model}
            </Text>
            {averageRating !== null && (
              <Text style={styles.ratingText}>
                ⭐ {averageRating.toFixed(1)} / 5.0
              </Text>
            )}
          </View>
          <View>
            <Text style={styles.price}>
              <Text style={styles.amount}>{formatNumber(vehicle.price_per_day)}đ</Text> /ngày
            </Text>
          </View>
          <Text style={styles.typetranText}>
            {vehicle.type}-{vehicle.transmission}
          </Text>
        </View>

        <Text style={styles.descriptionText}>{vehicle.description}</Text>
        <Text style={styles.propertiesText}>Thông tin chi tiết</Text>

        <View style={styles.propertiesArea}>
          <View style={styles.level}>
            <Text style={styles.propertyText}>
              <Text style={styles.labelText}>Sức mạnh động cơ: </Text>
              <Text style={styles.valueText}>
                {vehicle.properties.motor_power_hp} hp
              </Text>
            </Text>
            <Text style={styles.propertyText}>
              <Text style={styles.labelText}>Công suất động cơ: </Text>
              <Text style={styles.valueText}>
                {vehicle.properties.engine_capacity_cc} cc
              </Text>
            </Text>
          </View>
          <View style={styles.level}>
            <Text style={styles.propertyText}>
              <Text style={styles.labelText}>Nhiên liệu: </Text>
              <Text style={styles.valueText}>{vehicle.properties.fuel_type}</Text>
            </Text>
            <Text style={styles.propertyText}>
              <Text style={styles.labelText}>Sức kéo: </Text>
              <Text style={styles.valueText}>{vehicle.properties.traction}</Text>
            </Text>
          </View>
        </View>
        <View>
        <Text style={styles.propertiesText}>Đánh giá</Text>
        </View>
        {/* Hiển thị danh sách người dùng và số sao */}
        {userRatings.length > 0 && (
          <View style={styles.reviewsSection}>
            {userRatings.map((userRating, index) => (
              <View key={index} style={styles.reviewItem}>
                <Text style={styles.reviewUserName}>{userRating.name}</Text>
                <Text style={styles.reviewRating}>⭐ {userRating.rating}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.rentButton}
          onPress={() => {
            const user = auth.currentUser;
            if (!user) {
              Alert.alert("Thông Báo", "Bạn phải đăng nhập trước khi thuê xe", [
                { text: "OK" },
              ]);
              return;
            }
            navigation.navigate("Privacy", { vehicleId: vehicle.id });
          }}
        >
          <Text style={styles.rentButtonText}>Thuê xe</Text>
        </TouchableOpacity>
        {orderStatus && (
          <Text style={{ color: "green", fontWeight: "bold", textAlign: "center", marginTop: 10 }}>
            ✅ Trạng thái đơn hàng: {orderStatus}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default InfoScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    paddingRight: 35,
    paddingLeft: 35,
  },
  headerSection: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuIconStyle: {
    width: 25,
  },
  HeaderText: {
    fontSize: 20,
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 25,
  },
  imageSection: {
    width: "100%",
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  vehicleImage: {
    width: 300,
    height: 300,
  },
  headSection: {},
  topTextArea: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  makemodelText: {
    fontSize: 20,
    fontWeight: "500",
  },
  price: {
    fontWeight: "400",
  },
  amount: {
    fontWeight: "bold",
  },
  typetranText: {
    marginTop: 1,
    color: "#696969",
    fontWeight: "600",
    fontSize: 12,
  },
  descriptionText: {
    marginTop: 30,
    fontSize: 14,
    letterSpacing: 0.1,
    lineHeight: 18,
    color: "#696969",
    fontWeight: "500",
  },
  propertiesText: {
    marginTop: 20,
    fontSize: 19,
    fontWeight: "500",
  },
  propertiesArea: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  level: {
    marginRight: 30,
  },
  propertyText: {
    fontSize: 12,
    color: "#696969",
    marginBottom: 5,
  },
  labelText: {
    color: "#696969",
  },
  valueText: {
    fontSize: 12,
    color: "black",
  },
  rentButton: {
    marginTop: 50,
    height: 40,
    alignSelf: "center",
    width: 250,
    backgroundColor: "black",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  rentButtonText: {
    color: "white",
    fontWeight: "500",
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f39c12',
    marginTop: 10,
    textAlign: 'center',
  },
  reviewsSection: {
    marginTop: 20,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: '500',
  },
  reviewRating: {
    fontSize: 16,
    color: '#f39c12',
  },
});