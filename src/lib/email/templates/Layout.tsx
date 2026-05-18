import { Body, Container, Head, Html, Preview, Section, Text } from '@react-email/components';
import * as React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  preview?: string;
}

export function Layout({ children, preview }: LayoutProps) {
  return (
    <Html lang="en">
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={{ backgroundColor: '#f4f4f5', fontFamily: 'sans-serif', margin: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '40px auto', padding: '0 20px' }}>
          <Section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '40px',
              marginBottom: '16px',
            }}
          >
            {children}
          </Section>
          <Text style={{ color: '#71717a', fontSize: '12px', textAlign: 'center', margin: 0 }}>
            Tutor Platform · {new Date().getFullYear()}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
