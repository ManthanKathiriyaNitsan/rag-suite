import { ChatMessage } from "../ChatMessage";

export default function ChatMessageExample() {
  return (
    <div className="space-y-4 p-4 max-w-2xl">
      <ChatMessage
        type="user"
        content="How do I configure SSL certificates for my domain?"
        timestamp={new Date(Date.now() - 5 * 60 * 1000)}
      />
      
      <ChatMessage
        type="assistant"
        content="To configure SSL certificates for your domain, you'll need to follow these steps:

1. **Generate a Certificate**: You can use Let's Encrypt for free SSL certificates
2. **Configure your web server**: Update your Nginx or Apache configuration
3. **Set up automatic renewal**: Ensure certificates renew before expiry

The process varies depending on your hosting provider and web server configuration."
        citations={[
          { title: "SSL Setup Guide", url: "https://docs.example.com/ssl", snippet: "Complete guide to SSL certificate installation..." },
          { title: "Let's Encrypt Tutorial", url: "https://docs.example.com/letsencrypt", snippet: "How to use Let's Encrypt for free SSL..." }
        ]}
        timestamp={new Date(Date.now() - 4 * 60 * 1000)}
        showFeedback
      />
      
      <ChatMessage
        type="user"
        content="Thanks! That's exactly what I needed."
        timestamp={new Date()}
      />
    </div>
  );
}