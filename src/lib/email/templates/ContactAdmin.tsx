import { Heading, Text } from '@react-email/components';
import * as React from 'react';
import { Layout } from './Layout';

export interface ContactAdminProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactAdmin({ name, email, subject, message }: ContactAdminProps) {
  return (
    <Layout preview={`ახალი შეტყობინება: ${subject}`}>
      <Heading style={{ fontSize: '24px', color: '#18181b', margin: '0 0 16px' }}>
        ახალი საკონტაქტო შეტყობინება
      </Heading>
      <Text style={{ color: '#3f3f46', fontSize: '14px', margin: '0 0 8px' }}>
        <strong>გამგზავნი:</strong> {name} ({email})
      </Text>
      <Text style={{ color: '#3f3f46', fontSize: '14px', margin: '0 0 20px' }}>
        <strong>თემა:</strong> {subject}
      </Text>
      <Text
        style={{
          color: '#3f3f46',
          fontSize: '15px',
          lineHeight: '24px',
          whiteSpace: 'pre-wrap',
          margin: 0,
        }}
      >
        {message}
      </Text>
    </Layout>
  );
}
