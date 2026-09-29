import * as React from "react";
import { EmailLayout } from "../components/EmailLayout";
import { Text, Button, Section } from "@react-email/components";

interface NewMessageEmailProps {
  recipientName?: string;
  senderName?: string;
  messageSnippet?: string;
  chatUrl?: string;
}

export const NewMessageEmail: React.FC<NewMessageEmailProps> = ({
  recipientName = "Founder",
  senderName = "Arjun Mehta",
  messageSnippet = "Sounds great! Do you have 20 mins tomorrow evening for a quick intro call?",
  chatUrl = "https://connect.thefuturecouncil.in/messages",
}) => {
  return (
    <EmailLayout
      previewText={`${senderName} sent you a new message on TFC Connect`}
      eyebrow="NEW CHAT MESSAGE"
      heading={`New message from ${senderName}.`}
    >
      <Text style={paragraph}>Hi {recipientName},</Text>
      <Text style={paragraph}>
        <strong>{senderName}</strong> sent you a message in your private founder thread:
      </Text>

      <Section style={messageBox}>
        <Text style={messageText}>&ldquo;{messageSnippet}&rdquo;</Text>
      </Section>

      <Section style={btnSection}>
        <Button href={chatUrl} style={button}>
          Reply in Chat →
        </Button>
      </Section>

      <Text style={disclaimer}>
        Message notifications are batched to at most once per hour so your inbox stays clean.
      </Text>
    </EmailLayout>
  );
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  color: "#5A4E44",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const messageBox: React.CSSProperties = {
  backgroundColor: "#FFF4E8",
  borderLeft: "4px solid #E2542A",
  borderRadius: "0 10px 10px 0",
  padding: "16px 20px",
  margin: "20px 0",
};

const messageText: React.CSSProperties = {
  fontSize: "14px",
  color: "#1B1712",
  fontStyle: "italic",
  margin: "0",
  lineHeight: "1.5",
};

const btnSection: React.CSSProperties = {
  textAlign: "center",
  margin: "24px 0 16px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#E2542A",
  color: "#FFFFFF",
  fontSize: "15px",
  fontWeight: 600,
  padding: "14px 28px",
  borderRadius: "9999px",
  textDecoration: "none",
  display: "inline-block",
};

const disclaimer: React.CSSProperties = {
  fontSize: "12px",
  color: "#8C7D70",
  textAlign: "center",
  margin: "12px 0 0 0",
};

export default NewMessageEmail;
