import { SelectProps } from "@/types/SelectProps";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { StyleSheet, Text, View, Platform, Modal, TouchableOpacity } from "react-native";

export default function Select({
  label,
  selectedValue,
  onValueChange,
  options,
  style,
  leftIcon,
  placeholder,
}: SelectProps) {

  const [isModalVisible, setModalVisible] = useState(false);

  const pickerContainerStyle = [styles.pickerContainer, style];

  const pickerOptions = placeholder
    ? [{ label: placeholder, value: "" }, ...options]
    : options;

  const selectedOption = pickerOptions.find((o) => o.value === selectedValue);

  if (Platform.OS === "ios") return (
    <>
      <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={pickerContainerStyle} onTouchStart={() => setModalVisible(true)}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <View style={styles.pickerWrapper}>
          <Text>{selectedOption?.label}</Text>
          <MaterialIcons
            name="arrow-drop-down"
            size={24}
            color="#666"
            style={styles.dropdownIcon}
          />
        </View>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlayIOS} onTouchStart={() => setModalVisible(false)}>
        </View>
        <View style={styles.pickerHeaderIOS}>
          <MaterialIcons name="close" size={24} color="#007AFF" style={{paddingInline: 10}} onTouchStart={() => setModalVisible(false)}/>
        </View>
        <View style={styles.pickerWrapperIOS}>
          <Picker 
            selectedValue={selectedValue}
            onValueChange={onValueChange}          
            style={styles.pickerIOS}>
          {pickerOptions.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
              color={option.value === "" ? "#999" : "#424242"}
            />
          ))}
        </Picker>
        </View>
        <View style={styles.pickerFooterIOS}>
          <TouchableOpacity
              onPress={() => setModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.doneButtonText}>Concluído</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.modalOverlayIOS} onTouchStart={() => setModalVisible(false)}>
        </View>
      </Modal>
    </View>
    </>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={pickerContainerStyle}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <View style={styles.pickerWrapper}>
          
          <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={styles.picker}
            dropdownIconColor="#666"
            itemStyle={styles.pickerItem}
          >
            {pickerOptions.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
                color={option.value === "" ? "#999" : "#424242"}
              />
            ))}
          </Picker>
          <MaterialIcons
            name="arrow-drop-down"
            size={24}
            color="#666"
            style={styles.dropdownIcon}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#424242",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 24,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    overflow: "hidden",
  },
  pickerWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  picker: {
    flex: 1,
    height: 56,
    color: "#424242",
    paddingLeft: 12,
  },
  pickerItem: {
    paddingLeft: 20,
    fontSize: 16,
  },
  dropdownIcon: {
    position: "absolute",
    right: 12,
    pointerEvents: "none",
  },
  iconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },


  // IOS
  modalOverlayIOS: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  pickerIOS: {
    backgroundColor: "#fff",
    elevation: 4,
  },
  pickerWrapperIOS: {
    backgroundColor: "#e5e5e5",
    paddingVertical: 1,
  },
  pickerHeaderIOS: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#fff",
    height: 40,
  },
  pickerFooterIOS: {
    height: 44,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  doneButtonText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 18,
  },
});
