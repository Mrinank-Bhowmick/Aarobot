"use client";

import * as React from "react";
import { useRef, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Html5Qrcode } from "html5-qrcode";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, User, Loader2,ScanLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useChat } from '@ai-sdk/react';

export default function ChatbotPage() {
  const { toast } = useToast();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

const startScanner = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ video: true });
      }
    } catch (err) {
      console.error("Camera permission denied:", err);
      return;
    }

    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" }, // Use the back camera
        {
          fps: 50, // Frame per second
          qrbox: { width: 450, height: 350 }, // Scanning box size
        },
        (decodedText) => {
          handleInputChange({
            target: {
              value:
                "Product code is " + decodedText + ", is it harmful or not?",
            },
          } as React.ChangeEvent<HTMLInputElement>); // Append to the input field
          stopScanner();
        },
        (errorMessage) => {
          console.log("Scanning error:", errorMessage);
        }
      )
      .catch((err) => console.error("Scanner initialization error:", err));
    setIsScanning(true);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current = null;
        setIsScanning(false);
      });
    }
  };
  const { messages, input, handleInputChange, handleSubmit, status } =
    useChat({
      api: "https://aarobot.mastra.cloud/api/agents/Aarobot/stream",
      onError: (err) => {
        toast({
          title: "Error",
          description:
            err.message ||
            "Could not get a response from the assistant. Please try again.",
          variant: "destructive",
        });
        console.error("Error with chat stream:", err);
      },
    });

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      requestAnimationFrame(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      });
    }
  }, [messages]);

  return (
    <AppLayout>
      <Card className="shadow-md flex flex-col h-[calc(100vh-8rem)] max-h-[700px]">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" /> AI Health Assistant
          </CardTitle>
          <CardDescription>
            Ask questions about your health, records, or general medical
            information.
            <br />
            <span className="text-xs text-muted-foreground/80">
              Disclaimer: This is an AI assistant and cannot replace
              professional medical advice.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea
            className="h-full p-4 [&>div>div]:!block"
            ref={scrollAreaRef}
          >
            <div className="space-y-4 pr-4">
              {messages.length === 0 && status !== 'submitted' && status !== 'streaming' && (
                <div className="text-center text-muted-foreground p-8">
                  Start the conversation by typing your question below.
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot size={18} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg p-3 text-sm shadow-sm whitespace-pre-wrap",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.content}
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User size={18} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {(status === 'submitted' || status === 'streaming') && messages.length > 0 && messages[messages.length -1].role === 'user' && (
                <div className="flex items-start gap-3 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot size={18} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3 text-sm shadow-sm flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="pt-4 border-t">
          <form
            onSubmit={handleSubmit}
            className="flex w-full items-center space-x-2"
          >
            <Input
              id="message"
              placeholder="Type your message..."
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={handleInputChange}
              disabled={status === 'submitted' || status === 'streaming'}
            />
            <Button
              type="submit"
              size="icon"
              disabled={(status === 'submitted' || status === 'streaming') || !input.trim()}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
        <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={isScanning ? stopScanner : startScanner}
            >
              <ScanLine className="h-4 w-4 mr-2" />
              {isScanning ? "Stop Scanner" : "Scan Barcode"}
            </Button>
        <div id="reader" className="mt-2 w-1/2"></div> {/* Scanner video output will be here */}
      </Card>
    </AppLayout>
  );
}
