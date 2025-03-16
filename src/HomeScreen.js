import React, { useState } from "react";
import { ScrollView, TextInput, TouchableOpacity, Image, SafeAreaView, StyleSheet, Text, View } from "react-native";

const menu = require("./assets/icons/menu.png");
const magnifying_glass = require("./assets/icons/magnifying-glass.png");
const image_v_1 = require("./assets/vehicles/v-1.png");
const image_v_2 = require("./assets/vehicles/v-2.png");
const image_v_3 = require("./assets/vehicles/v-3.png");
const image_v_4 = require("./assets/vehicles/v-4.png");

import data from "./dataset/vehicles.json";

const HomeScreen = ({ navigation }) => {
  const [vehicles] = useState(data.vehicles);
  const [filteredVehicles, setFilteredVehicles] = useState(data.vehicles);
  const [selectedType, setSelectedType] = useState("All");
  const [searchKeyword, setSearchKeyword] = useState("");

  const getImage = (id) => {
    return [image_v_1, image_v_2, image_v_3, image_v_4][id - 1] || image_v_1;
  };

  const filterVehicles = (type, keyword) => {
    const lowercasedKeyword = keyword.toLowerCase();
    let results = vehicles.filter((vehicle) => vehicle.make.toLowerCase().includes(lowercasedKeyword));
    if (type !== "All") {
      results = results.filter((vehicle) => vehicle.type.toLowerCase() === type.toLowerCase());
    }
    setFilteredVehicles(results);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <Image source={menu} resizeMode="contain" style={styles.menuIconStyle} />
          </View>

          <View style={styles.searchSection}>
            <View style={styles.searchPallet}>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm xe"
                onChangeText={(text) => {
                  setSearchKeyword(text);
                  filterVehicles(selectedType, text);
                }}
                value={searchKeyword}
              />
              <Image source={magnifying_glass} resizeMode="contain" style={styles.magnifyingIconStyle} />
            </View>
          </View>

          {/* Promotional Section */}
          <View style={styles.promoSection}>
            <Text style={styles.promoTitle}>Giảm giá 40%</Text>
            <Text style={styles.promoSubtitle}>Trong ngày hôm nay</Text>
            <Text style={styles.promoText}>Nhận giảm giá cho mọi đơn hàng. Chỉ áp dụng trong hôm nay!</Text>
          </View>

          {/* Categories Section */}
          <View style={styles.categoriesSection}>
            <Text style={styles.categoriesTitle}>Danh mục</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesList}>
            {["Mercedes", "Tesla", "BMW", "Toyota", "Volvo", "Bugatti", "Honda", "Xe khác"].map((brand, index) => (
              <View key={index} style={styles.categoryItem}>
                <Text>{brand}</Text>
              </View>
            ))}
          </ScrollView>

          <Text style={styles.headText}>Được thuê nhiều nhất</Text>

          <ScrollView style={styles.elementPallet}>
            {filteredVehicles.map((vehicle) => (
              <TouchableOpacity
                style={styles.element}
                key={vehicle.id}
                activeOpacity={0.8}
                onPress={() => navigation.navigate("Info", { id: vehicle.id })}
              >
                <View style={styles.infoArea}>
                  <Text style={styles.infoTitle}>{vehicle.make} {vehicle.model}</Text>
                  <Text style={styles.infoSub}>{vehicle.type} - {vehicle.transmission}</Text>
                  <Text style={styles.infoPrice}><Text style={styles.infoAmount}>{vehicle.price_per_day}đ</Text> /ngày</Text>
                </View>
                <Image source={getImage(vehicle.id)} resizeMode="contain" style={styles.vehicleImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#e7e7e7" },
  container: { flex: 1, padding: 35 },
  headerSection: { height: 70, justifyContent: "center" },
  menuIconStyle: { width: 30 },
  title: { fontSize: 32, fontWeight: "600", marginVertical: 15 },
  searchSection: { marginBottom: 15,paddingBottom: 20 },
  searchPallet: { flexDirection: "row", borderRadius: 8, backgroundColor: "white", height: 40, alignItems: "center", paddingHorizontal: 10 },
  searchInput: { flex: 1, height: "100%" },
  magnifyingIconStyle: { width: 24, height: 24 },
  promoSection: { padding: 15, backgroundColor: "#f0f0f0", borderRadius: 10, marginBottom: 15 ,},
  promoTitle: { fontSize: 24, fontWeight: "bold" },
  promoSubtitle: { fontSize: 18, fontWeight: "600" ,paddingTop: 20},
  promoText: { fontSize: 14, color: "#696969" ,paddingTop: 20},
  categoriesSection: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  categoriesTitle: { fontSize: 18, fontWeight: "bold" ,paddingTop: 20},
  seeAll: { fontSize: 14, color: "blue" },
  categoriesList: { flexDirection: "row" },
  categoryItem: { marginRight: 15, padding: 10, backgroundColor: "white", borderRadius: 50 },
  headText: { fontSize: 18, fontWeight: "bold", marginBottom: 10 ,paddingTop: 20},
  elementPallet: { marginBottom: 20 },
  element: { flexDirection: "row", padding: 15, borderRadius: 10, backgroundColor: "white", marginBottom: 13 },
  infoArea: { flex: 1 },
  infoTitle: { fontSize: 15, fontWeight: "bold" },
  infoSub: { fontSize: 11, color: "#696969" },
  infoPrice: { fontSize: 10, color: "#696969", fontWeight: "bold", marginTop: 5 },
  infoAmount: { fontSize: 12, color: "black", fontWeight: "600" },
  vehicleImage: { width: 100, height: 60 }
});
