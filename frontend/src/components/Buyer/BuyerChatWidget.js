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
  Loader,
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
import { responses } from "../ChatWidget/buyerMockResponses";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hi! I'm your Warranty Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    "Share warranty",
    "QR codes",
    "Transfer NFT",
    "Warranty status",
    "Repair history",
    "Help",
  ];

  // Function to call backend chatbot API
  const callChatbotAPI = async (userMessages) => {
    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: userMessages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Chatbot API error:', error);
      return "I'm having trouble connecting to the warranty service. Please try again later.";
    }
  };

  // Function to check if a query should use mock responses
  const shouldUseMockResponse = (input) => {
    const lowerInput = input.toLowerCase();
    const mockKeywords = [
      'share warranty', 'qr code', 'transfer nft', 'warranty status', 
      'repair history', 'help', 'how to share', 'received warranty'
    ];
    
    return mockKeywords.some(keyword => lowerInput.includes(keyword));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: "user",
      text: inputValue,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Store the current input and clear it immediately
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      let response = null;

      // Check if we should use mock responses for specific warranty queries
      if (shouldUseMockResponse(currentInput)) {
        // Use mock responses for specific warranty queries
        const lowerInput = currentInput.toLowerCase();
        
        for (const [key, value] of Object.entries(responses)) {
          if (lowerInput.includes(key)) {
            response = value;
            break;
          }
        }

        if (!response) {
          response = {
            text: "I'm not sure about that. Try asking about: sharing warranties, QR codes, transfers, warranty status, repair history, or general help.",
            quickActions: ["Help", "How to use system?"],
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
      } else {
        // Use real chatbot API for general questions
        const apiMessages = messages
          .filter(msg => msg.type === "user" || msg.type === "bot")
          .map(msg => ({
            role: msg.type === "user" ? "user" : "assistant",
            content: msg.text
          }));

        // Add the current user message
        apiMessages.push({
          role: "user",
          content: currentInput
        });

        // Get response from backend
        const botResponse = await callChatbotAPI(apiMessages);

        // Add bot response
        const botMessage = {
          id: Date.now() + 1,
          type: "bot",
          text: botResponse,
          timestamp: new Date(),
          quickActions: getQuickActionsFromResponse(botResponse),
        };
        setMessages((prev) => [...prev, botMessage]);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: "Sorry, I'm having trouble processing your request. Please try again.",
        timestamp: new Date(),
        quickActions: ["Help", "Try again"],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to extract quick actions from bot response
  const getQuickActionsFromResponse = (response) => {
    const lowerResponse = response.toLowerCase();
    const actions = [];

    // Add relevant quick actions based on response content
    if (lowerResponse.includes('qr') || lowerResponse.includes('code')) {
      actions.push("Show QR codes", "How to scan QR?");
    }
    if (lowerResponse.includes('transfer') || lowerResponse.includes('nft')) {
      actions.push("Transfer NFT", "How to receive warranty?");
    }
    if (lowerResponse.includes('warranty') || lowerResponse.includes('status')) {
      actions.push("Check warranty status", "View warranty details");
    }
    if (lowerResponse.includes('repair') || lowerResponse.includes('history')) {
      actions.push("View repair history", "Add repair record");
    }
    if (lowerResponse.includes('share') || lowerResponse.includes('url')) {
      actions.push("Share warranty", "Generate URL");
    }

    // Default actions if no specific ones found
    if (actions.length === 0) {
      actions.push("Help", "More information");
    }

    return actions.slice(0, 3); // Limit to 3 actions
  };

  const handleQuickAction = (action) => {
    setInputValue(action);
    // Use setTimeout to ensure state is updated before calling handleSendMessage
    setTimeout(() => {
      handleSendMessage();
    }, 0);
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
                  <Text fw={600}>Warranty Assistant</Text>
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

                  {/* Loading indicator */}
                  {isLoading && (
                    <Box>
                      <Group gap="xs" mb="xs">
                        <IconRobot size={16} color="#228be6" />
                        <Text size="xs" c="dimmed">
                          {new Date().toLocaleTimeString()}
                        </Text>
                      </Group>
                      <Paper
                        p="sm"
                        style={{
                          backgroundColor: "#f8f9fa",
                          maxWidth: "80%",
                        }}
                      >
                        <Group gap="xs">
                          <Loader size="xs" />
                          <Text size="sm">Thinking...</Text>
                        </Group>
                      </Paper>
                    </Box>
                  )}

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
                disabled={isLoading}
              />
            </Paper>
          </Box>
        )}
      </Transition>
    </>
  );
};

export default ChatWidget;

