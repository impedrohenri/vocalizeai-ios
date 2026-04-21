import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#f9f9f9" },
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="atualizar-app"      
        options={{
          headerBackVisible: false,
          headerShown: false
        }}
      />
    </Stack>
  )
};