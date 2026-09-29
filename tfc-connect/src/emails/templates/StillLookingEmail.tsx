import * as React from "react";
import { EmailLayout } from "../components/EmailLayout";
import { Text, Button, Section } from "@react-email/components";

interface StillLookingEmailProps {
  recipientName?: string;
  refreshUrl?: string;
  browseUrl?: string;
}

export const StillLookingEmail: React.FC<StillLookingEmailProps> = ({
  recipientName = "Founder",
  refreshUrl = "https://connect.thefuturecouncil.in/match?still_looking=true",
  browseUrl = "https://connect.thefuturecouncil.in/people",
}) => {
  return (
    <EmailLayout
      previewText="Still looking for a co-founder? Keep your profile active on TFC Connect"
      eyebrow="PROFILE ACTIVITY CHECK"
      heading="Are you still looking for a co-founder?"
    >
      <Text style={paragraph}>Hi {recipientName},</Text>
      <Text style={paragraph}>
        It&apos;s been 30 days since you last updated your founder status. To make sure everyone
        in the daily match pool is actively building and responsive, we check in monthly.
      </Text>

      <Section style={infoBox}>
        <Text style={infoTitle}>📌 What happens when you confirm:</Text>
        <Text style={infoText}>
          Tapping below resets your 45-day match eligibility window so other founders continue to
          discover you in their 8:00 AM daily batches.
        </Text>
      </Section>

      <Section style={btnSection}>
        <Button href={refreshUrl} style={button}>
          Yes, I&apos;m Still Looking →
        </Button>
      </Section>

      <Text style={altActionText}>
        Found someone or taking a break? You can pause matching anytime from{" "}
        <a href={browseUrl} style={altLink}>
          your profile settings
        </a>
        .
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

const infoBox: React.CSSProperties = {
  backgroundColor: "#FFF4E8",
  border: "1px solid #EAD7C6",
  borderRadius: "14px",
  padding: "18px",
  margin: "20px 0",
};

const infoTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#1B1712",
  margin: "0 0 6px 0",
};

const infoText: React.CSSProperties = {
  fontSize: "13px",
  color: "#5A4E44",
  lineHeight: "1.5",
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

const altActionText: React.CSSProperties = {
  fontSize: "13px",
  color: "#8C7D70",
  textAlign: "center",
  margin: "12px 0 0 0",
  lineHeight: "1.5",
};

const altLink: React.CSSProperties = {
  color: "#AE3D18",
  textDecoration: "underline",
};

export default StillLookingEmail;
