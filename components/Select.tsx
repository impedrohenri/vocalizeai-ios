import { SelectProps } from "@/types/SelectProps";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, View, Modal, TouchableOpacity, FlatList, TouchableWithoutFeedback } from "react-native";

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
  const displayLabel = selectedOption?.label ?? placeholder ?? "Selecione...";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={pickerContainerStyle}
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
      >
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <View style={styles.pickerWrapper}>
          <Text
            style={[
              styles.triggerText,
              (selectedValue === "" || selectedValue == null) && { color: "#999" },
            ]}
          >
            {displayLabel}
          </Text>
          <MaterialIcons
            name="arrow-drop-down"
            size={24}
            color="#666"
            style={styles.dropdownIcon}
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={pickerOptions}
                keyExtractor={(item, index) =>
                  item.value != null ? String(item.value) : `fallback-key-${index}`
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => {
                      onValueChange(item.value);
                      setModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        item.value === selectedValue && styles.optionTextSelected,
                        item.value === "" && { color: "#999" },
                      ]}
                    >
                      {item.label}
                    </Text>

                    {item.value === selectedValue && item.value !== "" && (
                      <MaterialIcons name="check" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
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
  triggerText: {
    flex: 1,
    fontSize: 16,
    color: "#424242",
    paddingLeft: 12,
  },
  dropdownIcon: {
    position: "absolute",
    right: 12,
  },
  iconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    maxHeight: "80%",
    overflow: "hidden",
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#424242",
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  optionText: {
    fontSize: 16,
    color: "#424242",
  },
  optionTextSelected: {
    fontWeight: "bold",
    color: "#007AFF",
  },
});