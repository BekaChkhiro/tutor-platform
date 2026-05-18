import { Button, Heading, Section, Text } from '@react-email/components';
import React from 'react';
import { Layout } from './Layout';

interface VerifyEmailProps {
  firstName: string;
  verifyUrl: string;
}

export function VerifyEmail({ firstName, verifyUrl }: VerifyEmailProps) {
  return (
    <Layout preview="Verify your TutorPlatform email address">
      <Heading style={heading}>Verify your email address</Heading>
      <Text style={text}>Hi {firstName},</Text>
      <Text style={text}>
        Thanks for signing up. Click the button below to verify your email address. This link
        expires in 24 hours.
      </Text>
      <Section style={buttonSection}>
        <Button href={verifyUrl} style={button}>
          Verify email
        </Button>
      </Section>
      <Text style={hint}>Or copy and paste this URL into your browser:</Text>
      <Text style={url}>{verifyUrl}</Text>
      <Text style={footer}>
        If you didn&apos;t create a TutorPlatform account, you can safely ignore this email.
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
