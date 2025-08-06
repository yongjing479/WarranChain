import React from "react";
import { Box, Group, TextInput, ActionIcon } from "@mantine/core";
import { IconSend } from "@tabler/icons-react";

const ChatInput = ({ inputValue, setInputValue, onSendMessage }) => {
  return (
    <Box p="md" style={{ borderTop: "1px solid #dee2e6" }}>
      <Group gap="xs">
        <TextInput
          placeholder="Ask me anything..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
          style={{ flex: 1 }}
          size="sm"
        />
        <ActionIcon
          size="md"
          variant="filled"
          color="blue"
          onClick={onSendMessage}
        >
          <IconSend size={16} />
        </ActionIcon>
      </Group>
    </Box>
  );
};

export default ChatInput;
