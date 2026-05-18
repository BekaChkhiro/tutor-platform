import { Button, Heading, Link, Text } from '@react-email/components';
import * as React from 'react';
import { Layout } from './Layout';

export interface VerifyEmailProps {
  url: string;
}

export function VerifyEmail({ url }: VerifyEmailProps) {
  return (
    <Layout preview="Verify your email address">
      <Heading style={{ fontSize: '24px', color: '#18181b', margin: '0 0 16px' }}>
        Verify your email
      </Heading>
      <Text style={{ color: '#3f3f46', fontSize: '16px', lineHeight: '24px', margin: '0 0 24px' }}>
        Welcome! Click the button below to verify your email address. The link expires in 24 hours.
      </Text>
      <Button
        href={url}
        style={{
          backgroundColor: '#18181b',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '6px',
          fontWeight: 'bold',
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        Verify email
      </Button>
      <Text style={{ color: '#71717a', fontSize: '14px', margin: '24px 0 8px' }}>
        Or copy and paste this link: <Link href={url}>{url}</Link>
      </Text>
      <Text style={{ color: '#71717a', fontSize: '14px', margin: 0 }}>
        If you didn&apos;t create an account, you can safely ignore this email.
      </Text>
    </Layout>
  );
}
