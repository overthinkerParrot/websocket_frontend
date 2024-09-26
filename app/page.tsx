"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plug, ArrowRight, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type WebSocketMessage = {
  type: string;
  data?: string;
};

interface Message{
  id: number;
  content: string;
  sender: string;
}

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string|undefined>("");
  const [inputId, setInputId] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const wsRef = useRef<WebSocket | null>(null);

  const handleWebSocketMessage = useCallback((message: MessageEvent) => {
    const data: WebSocketMessage = JSON.parse(message.data);
    console.log(data);
    switch (data.type) {
      case "connect_id":
        setSessionId(data.data);
        break;
      case "connect_id_error":
        alert("Invalid session ID");
        break;
      default:
        setMessages((prev) => [
          ...prev,
          { id: prev.length, content: data.data, sender: "server" },
        ]);
        break;
    }
  }, []);

  const connect = () => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => {
      setLoading(false);
      setConnected(true);
      wsRef.current = ws;
      ws.send(JSON.stringify({ type: "connect" }));
    };

    ws.onmessage = handleWebSocketMessage;

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
    };
  };

  const connectWithID = () => {
    console.log("INPUT ID", inputId);
    //validate the input!!
    if (wsRef.current) {
      wsRef.current?.send(
        JSON.stringify({ type: "connect_id", sessionID: inputId })
      );
      setConnected(true);
    } else {
      const ws = new WebSocket("ws://localhost:8080");
      ws.onopen = () => {
        setLoading(false);
        setConnected(true);
        wsRef.current = ws;
        ws.send(JSON.stringify({ type: "connect_id", sessionID: inputId }));
      };

      ws.onmessage = handleWebSocketMessage;

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
      };
    }
  }

  const handleDisconnect = () => {
    wsRef.current?.send(JSON.stringify({ type: "disconnect" }));
    wsRef.current?.close();
    setConnected(false);
    setSessionId("");
  }
  const handleSendMessage = () => {
    if (wsRef.current) {
      wsRef.current.send(
        JSON.stringify({ type: "message", data: inputMessage })
      );
      setMessages((prev) => [
        ...prev,
        { id: prev.length, content: inputMessage, sender: "client" },
      ]);
      setInputMessage("");
    } else {
      alert("Not connected to any session");
    }
  };
  const copyToClipboard = ()=>{
    if(!sessionId){
      alert("No session ID to copy")
    }else{
      navigator.clipboard.writeText(sessionId).then(()=>{
        alert("Session ID copied to clipboard")
      })
    }
  }
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-wrap gap-4 justify-center">
        {!connected && (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>WebSocket Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="Connect with session ID"
                      value={inputId}
                      onChange={(e) => {
                        setInputId(e.target.value);
                      }}
                    />
                    <Button
                      onClick={connectWithID}
                      disabled={loading}
                      className="whitespace-nowrap"
                    >
                      {loading ? "Connecting..." : "Connect"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={connect}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Connecting..." : "Connect New Session"}
                    <Plug className="ml-2 h-4 w-4" />
                  </Button>
                </>
              </div>
            </CardContent>
          </Card>
        )}

        {connected && (
          <div className="flex flex-col h-[90vh] w-[50vw] mx-auto border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
              <div className="font-semibold">Chat Session</div>
              {sessionId && (
                <>
                  <Badge
                    variant={connected ? "default" : "secondary"}
                    className={connected ? "bg-green-500" : "bg-red-500"}
                  >
                    {connected ? "Connected" : "Disconnected"}: {sessionId}
                  </Badge>
                  <Button onClick={copyToClipboard}> <Copy /></Button>
                </>
              )}
            </div>
            <ScrollArea className="flex-grow p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-2 p-2 rounded-lg ${
                    message.sender === "client"
                      ? "bg-blue-500 text-white ml-auto"
                      : "bg-gray-200 text-gray-800"
                  } max-w-[80%] ${
                    message.sender === "client" ? "text-right" : "text-left"
                  }`}
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
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  disabled={!connected}
                />
                <Button onClick={handleSendMessage} disabled={!connected}>
                  Send
                </Button>
              </div>
              <Button
                onClick={handleDisconnect}
                disabled={!connected}
                variant="destructive"
                className="mt-2 w-full"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
