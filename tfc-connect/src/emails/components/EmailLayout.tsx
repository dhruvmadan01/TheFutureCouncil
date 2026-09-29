import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
} from "@react-email/components";

interface EmailLayoutProps {
  previewText: string;
  heading?: string;
  eyebrow?: string;
  children: React.ReactNode;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({
  previewText,
  heading,
  eyebrow = "TFC CONNECT",
  children,
}) => {
  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <table style={{ width: "100%" }} cellPadding="0" cellSpacing="0">
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "middle" }}>
                    <div style={logoBadge}>
                      <span style={logoText}>TFC</span>
                    </div>
                  </td>
                  <td style={{ verticalAlign: "middle", paddingLeft: "10px" }}>
                    <Text style={brandWordmark}>TFC Connect</Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Card Body */}
          <Section style={card}>
            {eyebrow && (
              <table cellPadding="0" cellSpacing="0" style={{ marginBottom: "12px" }}>
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: "middle", width: "12px" }}>
                      <div style={orangeDot} />
                    </td>
                    <td style={{ verticalAlign: "middle", paddingLeft: "6px" }}>
                      <span style={eyebrowText}>{eyebrow}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}

            {heading && <Text style={headingText}>{heading}</Text>}

            <div style={bodyContent}>{children}</div>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              You received this email because you have an active account on{" "}
              <Link href="https://thefuturecouncil.in" style={footerLink}>
                TFC Connect
              </Link>
              , the co-founder matching network by The Future Council.
            </Text>
            <Text style={footerText}>
              <Link href="https://connect.thefuturecouncil.in/me/settings" style={footerLink}>
                Notification Preferences
              </Link>{" "}
              ·{" "}
              <Link href="https://thefuturecouncil.in" style={footerLink}>
                thefuturecouncil.in
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main: React.CSSProperties = {
  backgroundColor: "#FFF4E8",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: "32px 16px",
  margin: "0",
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
};

const headerSection: React.CSSProperties = {
  marginBottom: "16px",
  padding: "0 8px",
};

const logoBadge: React.CSSProperties = {
  backgroundColor: "#E2542A",
  borderRadius: "6px",
  width: "28px",
  height: "28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  lineHeight: "28px",
};

const logoText: React.CSSProperties = {
  color: "#1B1712",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "-0.5px",
};

const brandWordmark: React.CSSProperties = {
  color: "#1B1712",
  fontSize: "18px",
  fontWeight: 800,
  margin: "0",
  letterSpacing: "-0.02em",
};

const card: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "18px",
  border: "1px solid #EAD7C6",
  padding: "32px 28px",
  boxShadow: "0 10px 30px -18px rgba(27, 23, 18, 0.12)",
};

const orangeDot: React.CSSProperties = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  backgroundColor: "#E2542A",
};

const eyebrowText: React.CSSProperties = {
  color: "#AE3D18",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const headingText: React.CSSProperties = {
  color: "#1B1712",
  fontSize: "24px",
  fontWeight: 800,
  letterSpacing: "-0.02em",
  lineHeight: "1.2",
  margin: "0 0 16px 0",
};

const bodyContent: React.CSSProperties = {
  color: "#5A4E44",
  fontSize: "15px",
  lineHeight: "1.6",
};

const footerSection: React.CSSProperties = {
  textAlign: "center",
  padding: "24px 16px 0 16px",
};

const footerText: React.CSSProperties = {
  color: "#8C7D70",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "4px 0",
};

const footerLink: React.CSSProperties = {
  color: "#AE3D18",
  textDecoration: "underline",
};
