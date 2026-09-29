import * as React from "react";
import { EmailLayout } from "../components/EmailLayout";
import { Text, Button, Section } from "@react-email/components";

interface ListingReminderEmailProps {
  recipientName?: string;
  startupName?: string;
  startupSlug?: string;
  lastUpdateDays?: number;
  updateUrl?: string;
}

export const ListingReminderEmail: React.FC<ListingReminderEmailProps> = ({
  recipientName = "Founder",
  startupName = "GreenBin",
  startupSlug = "greenbin",
  lastUpdateDays = 60,
  updateUrl,
}) => {
  const finalUpdateUrl =
    updateUrl || `https://connect.thefuturecouncil.in/startups/${startupSlug}#updates`;
  return (
    <EmailLayout
      previewText={`${startupName} hasn't posted an update in ${lastUpdateDays} days`}
      eyebrow="STARTUP DIRECTORY · ACTIVITY"
      heading={`Keep ${startupName} active & trending.`}
    >
      <Text style={paragraph}>Hi {recipientName},</Text>
      <Text style={paragraph}>
        Your startup <strong>{startupName}</strong> hasn&apos;t shared an update in the last{" "}
        <strong>{lastUpdateDays} days</strong>.
      </Text>

      <Section style={warningBox}>
        <Text style={warningBadge}>⚡ 90-DAY INACTIVE THRESHOLD</Text>
        <Text style={warningText}>
          Listings without updates for 90 days receive an &ldquo;Inactive&rdquo; badge and lose
          their trending boost in search results. Posting even a brief 2-sentence milestone
          keeps your profile fresh and surfaces your open roles to top student talent.
        </Text>
      </Section>

      <Section style={btnSection}>
        <Button href={finalUpdateUrl} style={button}>
          Post a Quick Update →
        </Button>
      </Section>

      <Text style={disclaimer}>
        You can post up to 3 updates per week. Milestones like demo videos, customer wins, and open roles perform best.
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

const warningBox: React.CSSProperties = {
  backgroundColor: "#FFF8E6",
  border: "1px solid #E6CA65",
  borderRadius: "14px",
  padding: "18px",
  margin: "20px 0",
};

const warningBadge: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 800,
  color: "#9A6412",
  letterSpacing: "0.08em",
  margin: "0 0 6px 0",
};

const warningText: React.CSSProperties = {
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

const disclaimer: React.CSSProperties = {
  fontSize: "12px",
  color: "#8C7D70",
  textAlign: "center",
  margin: "12px 0 0 0",
};

export default ListingReminderEmail;
