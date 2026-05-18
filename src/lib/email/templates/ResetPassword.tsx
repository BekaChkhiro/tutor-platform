import { Button, Heading, Link, Text } from '@react-email/components';
import * as React from 'react';
import { Layout } from './Layout';

export interface ResetPasswordProps {
  url: string;
}

export function ResetPassword({ url }: ResetPasswordProps) {
  return (
    <Layout preview="Reset your password">
      <Heading style={{ fontSize: '24px', color: '#18181b', margin: '0 0 16px' }}>
        Reset your password
      </Heading>
      <Text style={{ color: '#3f3f46', fontSize: '16px', lineHeight: '24px', margin: '0 0 24px' }}>
        You requested a password reset. Click the button below to set a new password. The link
        expires in 1 hour.
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
        Reset password
      </Button>
      <Text style={{ color: '#71717a', fontSize: '14px', margin: '24px 0 8px' }}>
        Or copy and paste this link: <Link href={url}>{url}</Link>
      </Text>
      <Text style={{ color: '#71717a', fontSize: '14px', margin: 0 }}>
        If you didn&apos;t request this, you can safely ignore this email.
      </Text>
    </Layout>
  );
}
