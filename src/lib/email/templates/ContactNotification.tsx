import { Button, Hr, Section, Text } from '@react-email/components';
import React from 'react';
import { Layout } from './Layout';

interface ContactNotificationProps {
  contactName: string;
  contactEmail: string;
  subject: string;
  message: string;
  ticketId: string;
}

export function ContactNotification({
  contactName,
  contactEmail,
  subject,
  message,
  ticketId,
}: ContactNotificationProps) {
  return (
    <Layout preview={`New contact form submission: ${subject}`}>
      <Text style={heading}>New Contact Form Submission</Text>
      <Text style={label}>From</Text>
      <Text style={value}>
        {contactName} &lt;{contactEmail}&gt;
      </Text>
      <Text style={label}>Subject</Text>
      <Text style={value}>{subject}</Text>
      <Text style={label}>Message</Text>
      <Section style={messageBox}>
        <Text style={messageText}>{message}</Text>
      </Section>
      <Hr style={divider} />
      <Text style={footer}>Ticket ID: {ticketId}</Text>
      <Button href={`${process.env.NEXTAUTH_URL}/admin/support/${ticketId}`} style={button}>
        View Ticket
      </Button>
    </Layout>
  );
}

const heading: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#0f172a',
  margin: '0 0 24px',
};

const label: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '16px 0 4px',
};

const value: React.CSSProperties = {
  fontSize: '15px',
  color: '#0f172a',
  margin: '0',
};

const messageBox: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '16px',
  margin: '4px 0 0',
};

const messageText: React.CSSProperties = {
  fontSize: '15px',
  color: '#0f172a',
  lineHeight: '1.6',
  margin: '0',
  whiteSpace: 'pre-wrap',
};

const divider: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
};

const footer: React.CSSProperties = {
  fontSize: '13px',
  color: '#94a3b8',
  margin: '0 0 12px',
};

const button: React.CSSProperties = {
  backgroundColor: '#0f172a',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'inline-block',
};
