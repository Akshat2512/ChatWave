import React, { useState } from 'react';
import { Modal, View, Image, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { ImageSourcePropType } from 'react-native';

interface ImageZoomModalProps {
  visible: boolean;
  onClose: () => void;
  imageSource: ImageSourcePropType;
}

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ visible, onClose, imageSource }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalContainer}>
          <Image source={imageSource} style={styles.zoomedImage} resizeMode="contain" />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomedImage: {
    width: '90%',
    height: '90%',
  },
});

export default ImageZoomModal;