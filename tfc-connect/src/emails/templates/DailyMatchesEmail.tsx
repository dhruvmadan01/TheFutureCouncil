import * as React from "react";
import { EmailLayout } from "../components/EmailLayout";
import { Text, Button, Section } from "@react-email/components";

interface DailyMatchesEmailProps {
  recipientName?: string;
  matchCount?: number;
  matchUrl?: string;
}

export const DailyMatchesEmail: React.FC<DailyMatchesEmailProps> = ({
  recipientName = "Founder",
  matchCount = 5,
  matchUrl = "https://connect.thefuturecouncil.in/match",
}) => {
  return (
    <EmailLayout
      previewText={`Your ${matchCount} co-founder matches for today are ready`}
      eyebrow="DAILY MATCHES · 8:00 AM IST"
      heading="Your matches are ready."
    >
      <Text style={paragraph}>Hi {recipientName},</Text>
      <Text style={paragraph}>
        We ran the matching algorithm across our network of founders from DU, NSUT, DTU,
        SRCC, IITs, and beyond. Your <strong>{matchCount} new co-founder matches</strong> for today
        are waiting on TFC Connect.
      </Text>

      <Section style={highlightBox}>
        <Text style={highlightTitle}>🎯 Matched on complementary skills & work style</Text>
        <Text style={highlightSubtitle}>
          Review why you match, inspect proof of work, and send a personalized note.
        </Text>
      </Section>

      <Section style={btnSection}>
        <Button href={matchUrl} style={button}>
          View Today&apos;s Matches →
        </Button>
      </Section>

      <Text style={disclaimer}>
        Matches refresh daily at 8:00 AM IST. Cards you pass on won&apos;t reappear for 90 days.
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

const highlightBox: React.CSSProperties = {
  backgroundColor: "#FFE9DF",
  border: "1px dashed #E2542A",
  borderRadius: "12px",
  padding: "16px",
  margin: "20px 0",
};

const highlightTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#AE3D18",
  margin: "0 0 4px 0",
};

const highlightSubtitle: React.CSSProperties = {
  fontSize: "13px",
  color: "#5A4E44",
  margin: "0",
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

export default DailyMatchesEmail;
