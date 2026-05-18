import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

type ResetPasswordTemplateProps = {
  resetUrl: string;
};

export function ResetPasswordTemplate({ resetUrl }: ResetPasswordTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your BitBid password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Reset your password</Text>
          <Text style={paragraph}>
            A request was made to reset your BitBid password. Use the button
            below to continue.
          </Text>
          <Section style={buttonSection}>
            <Button href={resetUrl} style={button}>
              Reset password
            </Button>
          </Section>
          <Text style={paragraph}>
            If you did not request this, you can safely ignore this email.
          </Text>
          <Text style={paragraph}>
            If the button does not work, copy this link into your browser:
          </Text>
          <Link href={resetUrl} style={link}>
            {resetUrl}
          </Link>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#0a0a0a',
  fontFamily: 'Inter, Arial, sans-serif',
  padding: '24px 0',
};

const container = {
  backgroundColor: '#101114',
  border: '1px solid #23262d',
  borderRadius: '12px',
  margin: '0 auto',
  maxWidth: '520px',
  padding: '24px',
};

const heading = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const paragraph = {
  color: '#c8ceda',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 14px',
};

const buttonSection = {
  margin: '20px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: '600',
  padding: '12px 16px',
  textDecoration: 'none',
};

const link = {
  color: '#93c5fd',
  fontSize: '13px',
  wordBreak: 'break-word' as const,
};
