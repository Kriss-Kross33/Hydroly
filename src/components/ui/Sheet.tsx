import React from "react";
import {
  Modal,
  Pressable,
  Text,
  View,
  type ModalProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SheetProps extends Omit<ModalProps, "transparent" | "animationType"> {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Sheet({
  visible,
  onClose,
  title,
  children,
  ...props
}: SheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      {...props}
    >
      <Pressable className="flex-1 justify-end bg-ink/30" onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="rounded-t-lg bg-surface px-6 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 24) }}
        >
          <View className="mb-4 items-center">
            <View className="h-1 w-10 rounded-full bg-border-default" />
          </View>
          {title ? (
            <Text className="mb-4 font-sans-medium text-xl text-ink">
              {title}
            </Text>
          ) : null}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
