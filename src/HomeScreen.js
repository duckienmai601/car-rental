import React, { useState, useEffect } from "react";
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  Alert,
} from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
// Import các file ảnh tĩnh
const magnifying_glass = require("./assets/icons/magnifying-glass.png");

const HomeScreen = ({ navigation }) => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("Tất cả");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };
  const formatNumber = (number) => {
    const numStr = number.toString().replace(/[^0-9]/g, "");
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  // Hàm lấy ảnh dựa trên tên file hoặc base64 string
  const getImage = (imageData) => {
    if (typeof imageData === "string" && imageData.startsWith("data:image")) {
      return { uri: imageData };
    } else {

      return require("./assets/icons/compass-active.png"); // Ảnh mặc định
    }
  };

  // Lấy dữ liệu từ Firestore
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "vehicles"));
        const vehiclesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(vehicle => vehicle.available_quantity > 0);
        
        setVehicles(vehiclesList);
        setFilteredVehicles(vehiclesList);
      } catch (error) {
        alert("Lỗi khi lấy dữ liệu: " + error.message);
      }
    };

    if (isFocused) {
      fetchVehicles(); // 👈 chỉ fetch khi màn hình được focus
    }
  }, [isFocused]); // 👈 khi isFocused thay đổi, useEffect chạy lại
  

  // Theo dõi trạng thái đăng nhập
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const filterVehicles = (filter, keyword) => {
    let results = [...vehicles];

    // Lọc theo từ khóa tìm kiếm
    if (keyword) {
      const lowercasedKeyword = keyword.toLowerCase();
      results = results.filter((vehicle) =>
        vehicle.make.toLowerCase().includes(lowercasedKeyword) ||
        vehicle.model.toLowerCase().includes(lowercasedKeyword)
      );
    }

    // Lọc theo tiêu chí
    if (filter === "Tên (A-Z)") {
      results.sort((a, b) => {
        const nameA = `${a.make} ${a.model}`.toLowerCase();
        const nameB = `${b.make} ${b.model}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } else if (filter === "Giá (Thấp-Cao)") {
      results.sort((a, b) => parseFloat(a.price_per_day.replace(/[^0-9.-]+/g, "")) - parseFloat(b.price_per_day.replace(/[^0-9.-]+/g, "")));
    } else if (filter === "Nhiên liệu (Xăng)") {
      results = results.filter(
        (vehicle) => vehicle.properties.fuel_type.toLowerCase() === "xăng"
      );
    } else if (filter === "Nhiên liệu (Điện)") {
      results = results.filter(
        (vehicle) => vehicle.properties.fuel_type.toLowerCase() === "điện"
      );
    } else if (filter === "Xe 4 chỗ") {
      results = results.filter(
        (vehicle) => vehicle.seat === "4"
      );
    } else if (filter === "Xe 7 chỗ") {
      results = results.filter(
        (vehicle) => vehicle.seat === "7"
      );
    }

    setFilteredVehicles(results);
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    filterVehicles(filter, searchKeyword);
  };

  // Xử lý khi nhấn vào biểu tượng thông báo
  const handleNotificationPress = () => {
    if (!user) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để xem thông báo!", [], {
        cancelable: true,
      });
    } else {
      navigation.navigate("Notify");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            {user ? (
              <>
                <Image
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/3177/3177440.png",
                  }}
                  style={styles.avatar}
                />
                <Text style={styles.greetingText}>Chào, {user.email}</Text>
              </>
            ) : (
              <>
                <Image
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/3177/3177440.png",
                  }}
                  style={styles.avatar}
                />
                <Text style={styles.greetingText}>Bạn chưa đăng nhập</Text>
              </>
            )}
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleNotificationPress}
              >
                <Ionicons name="notifications-outline" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchSection}>
            <View style={styles.searchPallet}>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm xe"
                onChangeText={(text) => {
                  setSearchKeyword(text);
                  filterVehicles(selectedFilter, text);
                }}
                value={searchKeyword}
              />
              <Image
                source={magnifying_glass}
                resizeMode="contain"
                style={styles.magnifyingIconStyle}
              />
            </View>
          </View>

          {/* Promotional Section */}
          <View style={styles.promoSection}>
            <Text style={styles.promoTitle}>Giảm giá 40%</Text>
            <Text style={styles.promoSubtitle}>Trong ngày hôm nay</Text>
            <Text style={styles.promoText}>
              Nhận giảm giá cho mọi đơn hàng. Chỉ áp dụng trong hôm nay!
            </Text>
          </View>

          {/* Categories Section */}
          <View style={styles.categoriesSection}>
            <Text style={styles.categoriesTitle}>Danh mục</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesList}
          >
            {[
              "Tất cả",
              "Tên (A-Z)",
              "Giá (Thấp-Cao)",
              "Nhiên liệu (Xăng)",
              "Nhiên liệu (Điện)",
              "Xe 4 chỗ",
              "Xe 7 chỗ",
            ].map((filter, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryItem,
                  selectedFilter === filter && styles.selectedCategoryItem,
                ]}
                onPress={() => handleFilterSelect(filter)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedFilter === filter && styles.selectedCategoryText,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.headText}>Danh sách xe</Text>

          <ScrollView style={styles.elementPallet}>
            {filteredVehicles.map((vehicle) => (
              <TouchableOpacity
                style={styles.element}
                key={vehicle.id}
                activeOpacity={0.8}
                onPress={() => navigation.navigate("Info", { id: vehicle.id })}
              >
                <View style={styles.infoArea}>
                  <Text style={styles.infoTitle}>
                    {vehicle.make} {vehicle.model}
                  </Text>
                  <Text style={styles.infoSub}>
                    Nhiên liệu:
                    <Text style={styles.valueText}>
                      {" "}
                      {vehicle.properties.fuel_type}
                    </Text>
                  </Text>
                  <Text style={styles.infoPrice}>
                    <Text style={styles.infoAmount}>
                      {formatNumber(vehicle.price_per_day)}đ
                    </Text>{" "}
                    /ngày
                  </Text>
                </View>
                <Image
                  source={getImage(vehicle.image)}
                  resizeMode="contain"
                  style={styles.vehicleImage}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#e7e7e7" },
  container: { flex: 1, padding: 35 },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    flex: 1,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 15,
  },
  searchSection: { marginBottom: 15, paddingBottom: 20 },
  searchPallet: {
    flexDirection: "row",
    borderRadius: 8,
    backgroundColor: "white",
    height: 40,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  searchInput: { flex: 1, height: "100%" },
  magnifyingIconStyle: { width: 24, height: 24 },
  promoSection: {
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginBottom: 15,
  },
  promoTitle: { fontSize: 24, fontWeight: "bold" },
  promoSubtitle: { fontSize: 18, fontWeight: "600", paddingTop: 20 },
  promoText: { fontSize: 14, color: "#696969", paddingTop: 20 },
  categoriesSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  categoriesTitle: { fontSize: 18, fontWeight: "bold", paddingTop: 20 },
  categoriesList: { flexDirection: "row" },
  categoryItem: {
    marginRight: 15,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 50,
  },
  selectedCategoryItem: {
    backgroundColor: "black",
  },
  categoryText: {
    fontSize: 14,
    color: "#333333",
  },
  selectedCategoryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  headText: { fontSize: 18, fontWeight: "bold", marginBottom: 10, paddingTop: 20 },
  elementPallet: { marginBottom: 20 },
  element: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "white",
    marginBottom: 13,
  },
  infoArea: { flex: 1 },
  infoTitle: { fontSize: 15, fontWeight: "bold" },
  infoSub: { fontSize: 11, color: "#696969" },
  valueText: { color: "#333333", fontWeight: "500" },
  infoPrice: { fontSize: 10, color: "#696969", fontWeight: "bold", marginTop: 5 },
  infoAmount: { fontSize: 12, color: "black", fontWeight: "600" },
  vehicleImage: { width: 100, height: 60 },
});

export default HomeScreen;