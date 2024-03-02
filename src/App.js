import { useState } from 'react'
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react";

const API_KEY = process.env.REACT_APP_API_KEY;

function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello Eena, I am BigBunBot, I am here to replace Dudu, he is sleeping right now!",
      sender: "BigBunBot"
    }
  ]);

  async function onSend(message) {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    }
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    const apiMessages = chatMessages.map(messageObj => {
      return {
        role: messageObj.sender === "BigBunBot" ? "assistant" : "user",
        content: messageObj.message
      }
    });

    const systemMessage = {
      role: "system",
      content: "You will play me when I am sleeping and your job is answering to my girl friend Eena. She will chat with you."
    };

    const payload = {
      "model": "gpt-3.5-turbo",
      "messages": [systemMessage, ...apiMessages]
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).then(data => {
      return data.json();
    }).then(data => {
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "BigBunBot"
      }]);
      setTyping(false);
    });
  }

  return (
    <MainContainer>
      <ChatContainer>
        <MessageList
          scrollBehavior='smooth'
          typingIndicator={typing ? <TypingIndicator content="BigBunBot is typing"/> : null}
        >
          {
            messages.map((message, index) => {
              return <Message key={index} model={message} />
            })
          }
        </MessageList>
        <MessageInput placeholder="Type message here" onSend={onSend}/>
      </ChatContainer>
    </MainContainer>
  )
}

export default App
