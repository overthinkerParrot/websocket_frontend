import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

type Message = {
  id: number
  sender: 'client' | 'server'
  content: string
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(true)
  const [messageId, setMessageId] = useState(0)

  useEffect(() => {
    // Simulate initial server message
    addMessage('server', 'Welcome to the chat! How can I assist you today?')
  }, [])

  const addMessage = (sender: 'client' | 'server', content: string) => {
    setMessages(prevMessages => [...prevMessages, { id: messageId, sender, content }])
    setMessageId(prevId => prevId + 1)
  }

  const handleSendMessage = () => {
    if (inputMessage.trim() && isConnected) {
      addMessage('client', inputMessage)
      setInputMessage('')
      
      // Simulate server response
      setTimeout(() => {
        addMessage('server', `Server received: "${inputMessage}"`)
      }, 1000)
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    addMessage('server', 'You have been disconnected from the server.')
  }

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md mx-auto border rounded-lg overflow-hidden">
      <ScrollArea className="flex-grow p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 p-2 rounded-lg ${
              message.sender === 'client'
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-gray-200 text-gray-800'
            } max-w-[80%] ${message.sender === 'client' ? 'text-right' : 'text-left'}`}
          >
            {message.content}
          </div>
        ))}
      </ScrollArea>
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            disabled={!isConnected}
          />
          <Button onClick={handleSendMessage} disabled={!isConnected}>
            Send
          </Button>
        </div>
        <Button
          onClick={handleDisconnect}
          disabled={!isConnected}
          variant="destructive"
          className="mt-2 w-full"
        >
          Disconnect
        </Button>
      </div>
    </div>
  )
}