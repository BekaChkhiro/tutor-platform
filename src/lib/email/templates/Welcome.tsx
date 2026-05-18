import { Heading, Text } from '@react-email/components';
import * as React from 'react';
import { Layout } from './Layout';

export interface WelcomeProps {
  firstName: string;
}

export function Welcome({ firstName }: WelcomeProps) {
  return (
    <Layout preview={`Welcome to Tutor Platform, ${firstName}!`}>
      <Heading style={{ fontSize: '24px', color: '#18181b', margin: '0 0 16px' }}>
        Welcome, {firstName}!
      </Heading>
      <Text style={{ color: '#3f3f46', fontSize: '16px', lineHeight: '24px', margin: 0 }}>
        Your account is verified and ready to go. Start exploring tutors and booking sessions.
      </Text>
    </Layout>
  );
}
