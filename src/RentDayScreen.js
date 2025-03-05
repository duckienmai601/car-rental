import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";

const RentDayScreen = () => {
  const navigation = useNavigation();
  const [selectedDates, setSelectedDates] = useState({});
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const handleDayPress = (day) => {
    if (day.dateString < today) return; // Không cho chọn ngày đã qua

    if (!fromDate || (fromDate && toDate)) {
      setFromDate(day.dateString);
      setToDate(null);
      setSelectedDates({ [day.dateString]: { selected: true, color: "#C3002F", textColor: "white" } });
    } else {
      setToDate(day.dateString);
      let range = {};
      let start = new Date(fromDate);
      let end = new Date(day.dateString);
      if (start > end) {
        [start, end] = [end, start]; // Đảo ngược nếu chọn ngược
      }
      let currentDate = new Date(start);
      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split("T")[0];
        range[dateStr] = { selected: true, color: "#C3002F", textColor: "white" };
        currentDate.setDate(currentDate.getDate() + 1);
      }
      setSelectedDates(range);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Choose the period you would like to rent</Text>
      </View>

      {/* Date Range */}
      <View style={styles.dateRange}>
        <View>
          <Text style={styles.label}>FROM</Text>
          <Text style={styles.dateText}>{fromDate || "--/--/----"}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
        <View>
          <Text style={styles.label}>TO</Text>
          <Text style={styles.dateText}>{toDate || "--/--/----"}</Text>
        </View>
      </View>

      {/* Calendar */}
      <Calendar
        current={today}
        minDate={today} // Ngày nhỏ nhất là hôm nay
        markedDates={selectedDates}
        markingType="period"
        onDayPress={handleDayPress}
        theme={{
          textDayFontWeight: "bold",
          todayTextColor: "#C3002F",
          arrowColor: "black",
        }}
      />

      {/* Confirm Button */}
      <TouchableOpacity style={styles.confirmButton} disabled={!toDate}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RentDayScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A1A", padding: 20, justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20, marginTop: 20 },
  backArrow: { fontSize: 24, color: "white", marginRight: 15 },
  headerText: { color: "white", fontSize: 22, fontWeight: "bold", flex: 1 },
  dateRange: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  label: { color: "#A0A0A0", fontSize: 12 },
  dateText: { color: "white", fontSize: 18, fontWeight: "bold" },
  arrow: { color: "white", fontSize: 20, fontWeight: "bold" },
  confirmButton: { marginTop: 20, backgroundColor: "#C3002F", padding: 15, borderRadius: 10, alignItems: "center" },
  confirmButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
