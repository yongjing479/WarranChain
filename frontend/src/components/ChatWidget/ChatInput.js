import React from "react";
import { Box, Group, TextInput, ActionIcon } from "@mantine/core";
import { IconSend } from "@tabler/icons-react";

const ChatInput = ({ onSendMessage, disabled, inputValue, setInputValue }) => {
  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      onSendMessage();
    }
  };

  return (
    <Box p="sm" style={{ borderTop: "1px solid #dee2e6" }}>
      <Group gap="xs">
        <TextInput
          placeholder="Ask me anything..."
          value={inputValue}
          onChange={(e) => setInputValue(e.currentTarget.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          style={{ flex: 1 }}
          size="sm"
          disabled={disabled}
        />
        <ActionIcon
          size="md"
          variant="filled"
          color="blue"
          onClick={handleSend}
          disabled={disabled}
        >
          <IconSend size={16} />
        </ActionIcon>
      </Group>
    </Box>
  );
};

export default ChatInput;
