import * as React from "react";
import { EmailLayout } from "../components/EmailLayout";
import { Text, Button, Section } from "@react-email/components";

interface NewRequestEmailProps {
  recipientName?: string;
  senderName?: string;
  senderHeadline?: string;
  matchScore?: number;
  noteSnippet?: string;
  requestUrl?: string;
}

export const NewRequestEmail: React.FC<NewRequestEmailProps> = ({
  recipientName = "Founder",
  senderName = "A founder",
  senderHeadline = "Tech Lead & Full-Stack Builder · NSUT",
  matchScore = 84,
  noteSnippet = "Hey! Loved your proof of work on the healthcare dashboard. Would love to explore teaming up.",
  requestUrl = "https://connect.thefuturecouncil.in/requests",
}) => {
  return (
    <EmailLayout
      previewText={`${senderName} sent you a connection request on TFC Connect`}
      eyebrow="NEW CONNECTION REQUEST"
      heading={`${senderName} wants to connect.`}
    >
      <Text style={paragraph}>Hi {recipientName},</Text>
      <Text style={paragraph}>
        You have a new co-founder connection request on TFC Connect. Here is a snapshot of
        their profile:
      </Text>

      <Section style={cardBox}>
        <table style={{ width: "100%" }} cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <td style={{ verticalAlign: "top" }}>
                <Text style={nameText}>{senderName}</Text>
                <Text style={subText}>{senderHeadline}</Text>
              </td>
              <td style={{ verticalAlign: "top", textAlign: "right", width: "90px" }}>
                <div style={scoreBadge}>
                  <span style={scoreNumber}>{matchScore}%</span>
                  <span style={scoreLabel}>MATCH</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {noteSnippet && (
          <div style={noteBox}>
            <Text style={noteLabel}>Personal note:</Text>
            <Text style={noteText}>&ldquo;{noteSnippet}&rdquo;</Text>
          </div>
        )}
      </Section>

      <Section style={btnSection}>
        <Button href={requestUrl} style={button}>
          Respond to Request →
        </Button>
      </Section>

      <Text style={disclaimer}>
        Accepting unlocks mutual contact details (email & LinkedIn) and creates your private chat thread.
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

const cardBox: React.CSSProperties = {
  backgroundColor: "#FFF4E8",
  border: "1px solid #EAD7C6",
  borderRadius: "14px",
  padding: "18px",
  margin: "20px 0",
};

const nameText: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 700,
  color: "#1B1712",
  margin: "0 0 4px 0",
};

const subText: React.CSSProperties = {
  fontSize: "13px",
  color: "#5A4E44",
  margin: "0",
};

const scoreBadge: React.CSSProperties = {
  backgroundColor: "#FFE9DF",
  borderRadius: "8px",
  padding: "6px 10px",
  textAlign: "center",
  display: "inline-block",
};

const scoreNumber: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 800,
  color: "#E2542A",
  display: "block",
  lineHeight: "1.1",
};

const scoreLabel: React.CSSProperties = {
  fontSize: "9px",
  fontWeight: 700,
  color: "#AE3D18",
  letterSpacing: "0.08em",
  display: "block",
};

const noteBox: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #EAD7C6",
  borderRadius: "10px",
  padding: "12px",
  marginTop: "14px",
};

const noteLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  color: "#8C7D70",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  margin: "0 0 4px 0",
};

const noteText: React.CSSProperties = {
  fontSize: "13px",
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

export default NewRequestEmail;
