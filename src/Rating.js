// Rating.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, Alert, StyleSheet } from "react-native";
import { doc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase"; // Import Firestore và Auth

const Rating = ({ vehicleId, orderStatus, orderId, onRated }) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const user = auth.currentUser;



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
          userEmail: user.email,
          rating: selectedRating,
        }),
      });

      // 🔽 Cập nhật isRated = true trong đơn hàng sau khi đánh giá
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        isRated: true,
      });
      if (onRated) onRated();
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
    backgroundColor: '#ffb300',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 10,
    elevation: 3,
  },
  ratingButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: '50%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
  },
  star: {
    fontSize: 40,
    color: '#ccc',
    marginHorizontal: 6,
  },
  selectedStar: {
    color: '#FFD700', // Màu vàng khi chọn
    transform: [{ scale: 1.2 }],
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 12,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeText: {
    marginTop: 16,
    color: '#999',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default Rating;