import * as React from "react";
import { EmailLayout } from "../components/EmailLayout";
import { Text, Button, Section } from "@react-email/components";

interface TeamedUpEmailProps {
  recipientName?: string;
  partnerName?: string;
  createStartupUrl?: string;
}

export const TeamedUpEmail: React.FC<TeamedUpEmailProps> = ({
  recipientName = "Founder",
  partnerName = "Kabir Anand",
  createStartupUrl = "https://connect.thefuturecouncil.in/startups/new",
}) => {
  return (
    <EmailLayout
      previewText={`🎉 Congratulations! You and ${partnerName} teamed up on TFC Connect`}
      eyebrow="TEAM FORMED · CELEBRATION"
      heading="You officially teamed up! 🤝"
    >
      <Text style={paragraph}>Hi {recipientName},</Text>
      <Text style={paragraph}>
        Both you and <strong>{partnerName}</strong> tapped <strong>&ldquo;We teamed up&rdquo;</strong>.
        This is our favorite milestone at The Future Council!
      </Text>

      <Section style={goldBox}>
        <Text style={goldBadge}>⭐ NEW FOUNDING DUO</Text>
        <Text style={goldTitle}>Ready to launch your startup profile?</Text>
        <Text style={goldText}>
          List your venture on the TFC Startup Directory. Both of you will be linked as co-founders
          with the official <strong>&ldquo;Met on TFC Connect 🤝&rdquo;</strong> badge.
        </Text>
      </Section>

      <Section style={btnSection}>
        <Button href={createStartupUrl} style={button}>
          Create Your Startup Listing →
        </Button>
      </Section>

      <Text style={disclaimer}>
        Need legal templates? Download our trial sprint guide, co-founder agreement checklist, and one-page NDA anytime from your chat panel.
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

const goldBox: React.CSSProperties = {
  backgroundColor: "#FFF8E6",
  border: "1px solid #E6CA65",
  borderRadius: "14px",
  padding: "20px",
  margin: "20px 0",
};

const goldBadge: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 800,
  color: "#9A6412",
  letterSpacing: "0.08em",
  margin: "0 0 6px 0",
};

const goldTitle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#1B1712",
  margin: "0 0 8px 0",
};

const goldText: React.CSSProperties = {
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

export default TeamedUpEmail;
