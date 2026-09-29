import * as React from "react";
import { EmailLayout } from "../components/EmailLayout";
import { Text, Button, Section } from "@react-email/components";

interface RequestAcceptedEmailProps {
  recipientName?: string;
  partnerName?: string;
  partnerCollege?: string;
  chatUrl?: string;
}

export const RequestAcceptedEmail: React.FC<RequestAcceptedEmailProps> = ({
  recipientName = "Founder",
  partnerName = "Priya Sharma",
  partnerCollege = "IIT Delhi",
  chatUrl = "https://connect.thefuturecouncil.in/messages",
}) => {
  return (
    <EmailLayout
      previewText={`${partnerName} accepted your connection request on TFC Connect!`}
      eyebrow="CONNECTION ACCEPTED"
      heading="You’re now connected."
    >
      <Text style={paragraph}>Hi {recipientName},</Text>
      <Text style={paragraph}>
        Great news! <strong>{partnerName}</strong> ({partnerCollege}) accepted your connection
        request. Mutual contact details are now unlocked on both profiles.
      </Text>

      <Section style={forestBox}>
        <Text style={forestTitle}>🤝 What to do next:</Text>
        <Text style={forestItem}>• Send a quick hello in your private chat thread</Text>
        <Text style={forestItem}>• Complete the 10 Founder Fit Kit alignment questions together</Text>
        <Text style={forestItem}>• Once aligned, tap &ldquo;We teamed up&rdquo; to launch your startup profile</Text>
      </Section>

      <Section style={btnSection}>
        <Button href={chatUrl} style={button}>
          Start the Conversation →
        </Button>
      </Section>

      <Text style={disclaimer}>
        Tip: 40% of founders who exchange at least 5 messages in the first 48 hours go on to form a team.
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

const forestBox: React.CSSProperties = {
  backgroundColor: "#E8F1ED",
  border: "1px solid #1F5A45",
  borderRadius: "14px",
  padding: "18px",
  margin: "20px 0",
};

const forestTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#1F5A45",
  margin: "0 0 8px 0",
};

const forestItem: React.CSSProperties = {
  fontSize: "13px",
  color: "#1B1712",
  margin: "4px 0",
};

const btnSection: React.CSSProperties = {
  textAlign: "center",
  margin: "24px 0 16px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#1F5A45",
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

export default RequestAcceptedEmail;
