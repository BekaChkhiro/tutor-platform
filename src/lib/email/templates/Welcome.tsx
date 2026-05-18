import { Button, Heading, Section, Text } from '@react-email/components';
import React from 'react';
import { Layout } from './Layout';

interface WelcomeProps {
  firstName: string;
  loginUrl: string;
}

export function Welcome({ firstName, loginUrl }: WelcomeProps) {
  return (
    <Layout preview={`Welcome to TutorPlatform, ${firstName}!`}>
      <Heading style={heading}>Welcome, {firstName}!</Heading>
      <Text style={text}>
        Your account is verified and ready. Start exploring tutors and booking your first session
        today.
      </Text>
      <Section style={buttonSection}>
        <Button href={loginUrl} style={button}>
          Get started
        </Button>
      </Section>
      <Text style={footer}>
        If you didn&apos;t create this account, you can safely ignore this email.
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
  margin: '0 0 24px',
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

const footer: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0',
};
