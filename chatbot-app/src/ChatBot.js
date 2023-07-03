import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import { HStack, Input, Button, Box, Heading, Text, VStack, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, IconButton } from "@chakra-ui/react";
import { ChatIcon } from "@chakra-ui/icons";
import './App.css';

const ChatBot = () => {
  const inputRef = useRef();
  const chatRef = useRef();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const socketIo = io('http://localhost:3000', { transports: ['websocket'], upgrade: false });
    setSocket(socketIo);
  }, []);

  const addMessage = (message, sender) => {
    setMessages((prevMessages) => [...prevMessages, { text: message, sender }]);
  };

  useEffect(() => {
    if (socket) {
      addMessage("Hi this is the Library chatbot, how may I help you?", 'chatbot');

      socket.on('message', function (message) {
        addMessage(message, 'chatbot');
      });

      socket.on('disconnected', function (message) {
        addMessage(message, 'chatbot');
      });

      if (socket) {
        socket.on('disconnect', () => {
          addMessage('User disconnected....', 'chatbot');
        });
        return () => {
          socket.off('disconnected');
        }
      }
    }
  }, [socket]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (inputRef.current.value) {
      addMessage(inputRef.current.value, 'user');
      if (socket) {
        socket.emit("sendMessage", inputRef.current.value, (message) => console.log(message));
      }
      inputRef.current.value = "";
    }
  }


  return (
    <>
      <IconButton
        onClick={onOpen}
        icon={<ChatIcon />}
        position="fixed"
        bottom={4}
        right={4}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxW="350px" position="fixed" bottom="60px" right="4" borderRadius="md">
          <ModalHeader>Chat with Chatbot</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box ref={chatRef} borderWidth={1} borderRadius="md" p={3} mb={3} overflowY="auto" height="60vh">
              <VStack align="start" spacing={4}>
                {messages.map((message, index) => (
                  <Box key={index} maxW="md" p={5} rounded="md" bg={message.sender === 'user' ? 'blue.500' : 'gray.200'} alignSelf={message.sender === 'user' ? 'flex-end' : 'flex-start'}>
                    <Text color={message.sender === 'user' ? 'white' : 'black'}>
                      {message.text}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>
            <form onSubmit={handleFormSubmit}>
              <HStack spacing={3}>
                <Input ref={inputRef} placeholder="Type your message..." />
                <Button colorScheme="blue" type="submit">Send</Button>
              </HStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ChatBot;