import { Button, Heading, Section, Text } from '@react-email/components';
import React from 'react';
import { Layout } from './Layout';

interface ResetPasswordProps {
  firstName: string;
  resetUrl: string;
}

export function ResetPassword({ firstName, resetUrl }: ResetPasswordProps) {
  return (
    <Layout preview="Reset your TutorPlatform password">
      <Heading style={heading}>Reset your password</Heading>
      <Text style={text}>Hi {firstName},</Text>
      <Text style={text}>
        We received a request to reset your password. Click the button below to set a new one. This
        link expires in 1 hour.
      </Text>
      <Section style={buttonSection}>
        <Button href={resetUrl} style={button}>
          Reset password
        </Button>
      </Section>
      <Text style={hint}>Or copy and paste this URL into your browser:</Text>
      <Text style={url}>{resetUrl}</Text>
      <Text style={footer}>
        If you didn&apos;t request a password reset, you can safely ignore this email. Your password
        will not be changed.
      </Text>
    </Layout>
  );
}

const heading: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '26px',
  fontWeight: '700',
  margin: '0 0 16px',
};

const text: React.CSSProperties = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const buttonSection: React.CSSProperties = {
  margin: '0 0 32px',
};

const button: React.CSSProperties = {
  backgroundColor: '#0f172a',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
};

const hint: React.CSSProperties = {
  color: '#64748b',
  fontSize: '13px',
  margin: '0 0 8px',
};

const url: React.CSSProperties = {
  color: '#3b82f6',
  fontSize: '13px',
  wordBreak: 'break-all',
  margin: '0 0 24px',
};

const footer: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0',
};
