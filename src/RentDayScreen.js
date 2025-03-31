import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";


const RentDayScreen = ({ route }) => {
  const navigation = useNavigation();

  // Kiểm tra route.params và vehicleId
  if (!route.params || !route.params.vehicleId) {
    Alert.alert("Lỗi", "Không tìm thấy ID xe. Vui lòng thử lại.", [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
    return null;
  }

  const { vehicleId } = route.params;
  const [selectedDates, setSelectedDates] = useState({});
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [fromTime, setFromTime] = useState(null);
  const [toTime, setToTime] = useState(null);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleDayPress = (day) => {
    if (day.dateString < today) return; // Không cho chọn ngày đã qua

    if (!fromDate || (fromDate && toDate)) {
      setFromDate(day.dateString);
      setToDate(null);
      setFromTime(null);
      setToTime(null);
      setSelectedDates({ [day.dateString]: { selected: true, startingDay: true, color: "#C3002F", textColor: "white" } });
    } else {
      setToDate(day.dateString);
      // Tự động đặt toTime giống fromTime nếu fromTime đã được chọn
      if (fromTime) {
        setToTime(fromTime);
      }
      let range = {};
      let start = new Date(fromDate);
      let end = new Date(day.dateString);
      if (start > end) {
        [start, end] = [end, start];
        setFromDate(end.toISOString().split("T")[0]);
        setToDate(start.toISOString().split("T")[0]);
      }
      let currentDate = new Date(start);
      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split("T")[0];
        range[dateStr] = {
          selected: true,
          color: "#C3002F",
          textColor: "white",
          startingDay: dateStr === start.toISOString().split("T")[0],
          endingDay: dateStr === end.toISOString().split("T")[0],
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }
      setSelectedDates(range);
      console.log("Marked Dates:", range); // Debug để kiểm tra markedDates
    }
  };

  // Xử lý khi chọn thời gian bắt đầu
  const handleFromTimeChange = (event, selectedTime) => {
    setShowFromTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, "0");
      const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
      const newFromTime = `${hours}:${minutes}`;
      setFromTime(newFromTime);
      // Nếu toDate đã được chọn, tự động đặt toTime giống fromTime
      if (toDate) {
        setToTime(newFromTime);
      }
    }
  };

  // Kiểm tra thời gian hợp lệ
  const isTimeValid = () => {
    if (!fromDate || !toDate || !fromTime || !toTime) return false;

    const fromDateTime = new Date(`${fromDate}T${fromTime}:00`);
    const toDateTime = new Date(`${toDate}T${toTime}:00`);
    const now = new Date();

    // Không cho phép thời gian bắt đầu trước hiện tại
    if (fromDateTime < now) {
      Alert.alert("Lỗi", "Thời gian bắt đầu không thể trước thời điểm hiện tại.");
      return false;
    }

    // Thời gian kết thúc phải sau thời gian bắt đầu
    if (toDateTime <= fromDateTime) {
      Alert.alert("Lỗi", "Thời gian kết thúc phải sau thời gian bắt đầu.");
      return false;
    }

    return true;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Chọn thời gian bạn muốn thuê!</Text>
      </View>

      {/* Date Range */}
      <View style={styles.dateRange}>
        <View>
          <Text style={styles.label}>Từ Ngày</Text>
          <Text style={styles.dateText}>{fromDate || "--/--/----"}</Text>
          {fromDate && (
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowFromTimePicker(true)}
            >
              <Text style={styles.timeText}>
                {fromTime || "Chọn giờ"}
              </Text>
            </TouchableOpacity>
          )}
          {showFromTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              display="spinner"
              onChange={handleFromTimeChange}
              textColor="white" 
              accentColor="white" 
            />
          )}
        </View>
        <Text style={styles.arrow}>→</Text>
        <View>
          <Text style={styles.label}>Đến Ngày</Text>
          <Text style={styles.dateText}>{toDate || "--/--/----"}</Text>
          {toDate && (
            <View style={styles.timeButton}>
              <Text style={styles.timeText}>
                {toTime || "Chọn giờ bắt đầu trước"}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Calendar */}
      <Calendar
        current={today}
        minDate={today}
        markedDates={selectedDates}
        markingType="period"
        onDayPress={handleDayPress}
        theme={{
          textDayFontWeight: "bold",
          todayTextColor: "#C3002F",
          arrowColor: "black",
          selectedDayTextColor: "white", // Đảm bảo font chữ của ngày được chọn là trắng
          selectedDayBackgroundColor: "#C3002F", // Đảm bảo màu nền của ngày được chọn
          dayTextColor: "black", // Màu chữ mặc định cho các ngày không được chọn
          textDisabledColor: "#A0A0A0", // Màu chữ cho các ngày bị vô hiệu hóa
        }}
      />

      {/* Confirm Button */}
      <TouchableOpacity
        style={[styles.confirmButton, { opacity: toDate && fromTime && toTime ? 1 : 0.5 }]}
        disabled={!toDate || !fromTime || !toTime}
        onPress={() => {
          if (isTimeValid()) {
            navigation.navigate("Checkout", { vehicleId, fromDate, toDate, fromTime, toTime });
          }
        }}
      >
        <Text style={styles.confirmButtonText}>Tiếp tục</Text>
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
  timeButton: { marginTop: 10, backgroundColor: "#333", padding: 10, borderRadius: 5, alignItems: "center" },
  timeText: { color: "white", fontSize: 16 },
  confirmButton: { marginTop: 20, backgroundColor: "#C3002F", padding: 15, borderRadius: 10, alignItems: "center" },
  confirmButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});