// Rating.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, Alert, StyleSheet } from "react-native";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase"; // Import Firestore và Auth

const Rating = ({ vehicleId, orderStatus }) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const user = auth.currentUser;

  // ❌ Xoá useEffect và fetchOrderStatus vì ta truyền status từ ngoài vào
  // ✅ Giữ lại submitRating như cũ

  const submitRating = async () => {
    if (!selectedRating) {
      Alert.alert("Lỗi", "Bạn chưa chọn số sao");
      return;
    }
  
    try {
      const vehicleRef = doc(db, "vehicles", vehicleId);
      await updateDoc(vehicleRef, {
        ratings: arrayUnion({
          userId: user.uid,
          userEmail: user.email, // Lưu email người dùng
          rating: selectedRating,
        }),
      });
  
      Alert.alert("Cảm ơn!", "Bạn đã đánh giá thành công.");
      setShowRatingModal(false);
    } catch (error) {
      console.error("Lỗi khi lưu đánh giá:", error);
      Alert.alert("Lỗi", "Không thể lưu đánh giá.");
    }
  };
  

  return (
    <>
      {user && orderStatus?.toLowerCase() === "hoàn thành" && (
        <TouchableOpacity style={styles.ratingButton} onPress={() => setShowRatingModal(true)}>
          <Text style={styles.ratingButtonText}>Đánh giá dịch vụ</Text>
        </TouchableOpacity>
      )}

      <Modal visible={showRatingModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Chọn số sao</Text>
          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setSelectedRating(star)}>
                <Text style={[styles.star, selectedRating >= star && styles.selectedStar]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={submitRating}>
            <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowRatingModal(false)}>
            <Text style={styles.closeText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  ratingButton: {
    backgroundColor: "#ffcc00",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
  },
  starContainer: {
    flexDirection: "row",
  },
  star: {
    fontSize: 40,
    color: "#bbb",
    marginHorizontal: 5,
  },
  selectedStar: {
    color: "#ffcc00",
  },
  submitButton: {
    backgroundColor: "#00cc66",
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
  },
  closeText: {
    color: "white",
    fontSize: 16,
    marginTop: 10,
  },
});

export default Rating;
