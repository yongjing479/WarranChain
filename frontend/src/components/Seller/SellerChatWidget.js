import React, { useState, useRef, useEffect } from "react";
import {
  ActionIcon,
  Box,
  Paper,
  Text,
  TextInput,
  Button,
  Stack,
  Group,
  ScrollArea,
  Badge,
  Collapse,
  Transition,
} from "@mantine/core";
import {
  IconMessageCircle,
  IconX,
  IconSend,
  IconRobot,
  IconUser,
  IconChevronUp,
  IconChevronDown,
} from "@tabler/icons-react";
import ChatInput from "../ChatWidget/ChatInput";
import { sellerResponses } from "../ChatWidget/sellerMockResponses";

const SellerChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hi! I'm your Seller Warranty Assistant. How can I help you manage your warranties today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    "Issue warranty",
    "Warranty details",
    "Buyer address",
    "Warranty period",
    "Product brands",
    "Dashboard stats",
    "QR codes",
    "Help",
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: "user",
      text: inputValue,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Find response
    const lowerInput = inputValue.toLowerCase();
    let response = null;

    for (const [key, value] of Object.entries(sellerResponses)) {
      if (lowerInput.includes(key)) {
        response = value;
        break;
      }
    }

    if (!response) {
      response = {
        text: "I'm not sure about that. Try asking about: issuing warranties, warranty details, buyer addresses, warranty periods, product brands, dashboard stats, QR codes, or general help.",
        quickActions: ["Help", "How to issue warranty?"],
      };
    }

    // Add bot response
    const botMessage = {
      id: Date.now() + 1,
      type: "bot",
      text: response.text,
      timestamp: new Date(),
      quickActions: response.quickActions,
    };
    setMessages((prev) => [...prev, botMessage]);

    setInputValue("");
  };

  const handleQuickAction = (action) => {
    setInputValue(action);
    handleSendMessage();
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Box
        style={{
          position: "fixed",
          bottom: "100px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        <ActionIcon
          size="xl"
          radius="xl"
          variant="filled"
          color="blue"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {isOpen ? <IconX size={24} /> : <IconMessageCircle size={24} />}
        </ActionIcon>
      </Box>

      {/* Chat Modal */}
      <Transition
        mounted={isOpen}
        transition="scale"
        duration={200}
        timingFunction="ease-out"
      >
        {(styles) => (
          <Box
            style={{
              position: "fixed",
              bottom: "160px",
              right: "20px",
              width: "350px",
              height: "500px",
              zIndex: 999,
              transformOrigin: "bottom right",
              ...styles,
            }}
          >
            <Paper
              shadow="lg"
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <Box
                style={{
                  padding: "16px",
                  borderBottom: "1px solid #dee2e6",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <Group>
                  <IconRobot size={20} color="#228be6" />
                  <Text fw={600}>Seller Warranty Assistant</Text>
                  <Badge size="xs" color="blue">
                    AI
                  </Badge>
                </Group>
              </Box>

              {/* Messages */}
              <ScrollArea style={{ flex: 1, padding: "16px" }}>
                <Stack gap="md">
                  {messages.map((message) => (
                    <Box key={message.id}>
                      <Group gap="xs" mb="xs">
                        {message.type === "bot" ? (
                          <IconRobot size={16} color="#228be6" />
                        ) : (
                          <IconUser size={16} color="#40c057" />
                        )}
                        <Text size="xs" c="dimmed">
                          {message.timestamp.toLocaleTimeString()}
                        </Text>
                      </Group>
                      <Paper
                        p="sm"
                        style={{
                          backgroundColor:
                            message.type === "bot" ? "#f8f9fa" : "#e7f5ff",
                          maxWidth: "80%",
                          marginLeft: message.type === "bot" ? "0" : "auto",
                        }}
                      >
                        <Text size="sm">{message.text}</Text>
                      </Paper>

                      {/* Quick Actions */}
                      {message.quickActions && message.type === "bot" && (
                        <Stack gap="xs" mt="xs">
                          {message.quickActions.map((action, index) => (
                            <Button
                              key={index}
                              size="xs"
                              variant="light"
                              color="blue"
                              onClick={() => handleQuickAction(action)}
                              style={{ alignSelf: "flex-start" }}
                            >
                              {action}
                            </Button>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  ))}

                  {/* Invisible element for auto-scroll */}
                  <div ref={messagesEndRef} />
                </Stack>
              </ScrollArea>

              {/* Quick Questions - Collapsible */}
              <Box style={{ borderTop: "1px solid #dee2e6" }}>
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => setShowQuickQuestions(!showQuickQuestions)}
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: 0,
                    padding: "8px 16px",
                  }}
                  leftSection={
                    showQuickQuestions ? (
                      <IconChevronDown size={16} />
                    ) : (
                      <IconChevronUp size={16} />
                    )
                  }
                >
                  <Text size="xs" fw={500} c="dimmed">
                    Quick Questions
                  </Text>
                </Button>

                <Collapse
                  in={showQuickQuestions}
                  transitionDuration={300}
                  transitionTimingFunction="ease"
                >
                  <Box p="md" style={{ borderTop: "1px solid #dee2e6" }}>
                    <Box
                      style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                    >
                      {quickQuestions.map((question, index) => (
                        <Button
                          key={index}
                          size="xs"
                          variant="outline"
                          onClick={() => handleQuickAction(question)}
                          style={{
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                            minWidth: "fit-content",
                          }}
                        >
                          {question}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                </Collapse>
              </Box>

              <ChatInput
                inputValue={inputValue}
                setInputValue={setInputValue}
                onSendMessage={() => handleSendMessage()}
              />
            </Paper>
          </Box>
        )}
      </Transition>
    </>
  );
};

export default SellerChatWidget;
