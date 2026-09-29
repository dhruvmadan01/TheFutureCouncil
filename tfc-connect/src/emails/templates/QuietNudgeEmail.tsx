import * as React from "react";
import { EmailLayout } from "../components/EmailLayout";
import { Text, Button, Section } from "@react-email/components";

interface QuietNudgeEmailProps {
  recipientName?: string;
  partnerName?: string;
  chatUrl?: string;
}

export const QuietNudgeEmail: React.FC<QuietNudgeEmailProps> = ({
  recipientName = "Founder",
  partnerName = "Ananya Roy",
  chatUrl = "https://connect.thefuturecouncil.in/messages",
}) => {
  return (
    <EmailLayout
      previewText={`Quiet for 5 days: Reconnect with ${partnerName} on TFC Connect`}
      eyebrow="CONVERSATION NUDGE"
      heading="Keep the momentum going."
    >
      <Text style={paragraph}>Hi {recipientName},</Text>
      <Text style={paragraph}>
        It&apos;s been 5 days since your last message with <strong>{partnerName}</strong>. Early
        co-founder discovery moves fast, and great teams are built on consistent touchpoints.
      </Text>

      <Section style={starterBox}>
        <Text style={starterTitle}>💡 Conversation starters to break the quiet:</Text>
        <Text style={starterItem}>
          1. <em>&ldquo;Have you answered question #3 from the Founder Fit Kit? Let&apos;s compare working hours!&rdquo;</em>
        </Text>
        <Text style={starterItem}>
          2. <em>&ldquo;Want to jump on a quick 15-minute sync this week to map out an MVP scope?&rdquo;</em>
        </Text>
        <Text style={starterItem}>
          3. <em>&ldquo;Check out this competitor teardown I put together.&rdquo;</em>
        </Text>
      </Section>

      <Section style={btnSection}>
        <Button href={chatUrl} style={button}>
          Open Conversation →
        </Button>
      </Section>

      <Text style={disclaimer}>
        Not the right fit? You can gracefully close the thread or update your connection status anytime.
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

const starterBox: React.CSSProperties = {
  backgroundColor: "#FFF4E8",
  border: "1px solid #EAD7C6",
  borderRadius: "14px",
  padding: "18px",
  margin: "20px 0",
};

const starterTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#1B1712",
  margin: "0 0 10px 0",
};

const starterItem: React.CSSProperties = {
  fontSize: "13px",
  color: "#5A4E44",
  lineHeight: "1.5",
  margin: "6px 0",
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

export default QuietNudgeEmail;
