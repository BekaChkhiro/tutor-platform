import { Button, Heading, Section, Text } from '@react-email/components';
import React from 'react';
import { Layout } from './Layout';

interface TutorSubmittedForReviewProps {
  tutorName: string;
  tutorEmail: string;
  tutorSlug: string;
  adminUrl: string;
}

export function TutorSubmittedForReview({
  tutorName,
  tutorEmail,
  tutorSlug,
  adminUrl,
}: TutorSubmittedForReviewProps) {
  return (
    <Layout preview={`New tutor application from ${tutorName}`}>
      <Heading style={heading}>New tutor application</Heading>
      <Text style={text}>
        <strong>{tutorName}</strong> ({tutorEmail}) has completed their profile and submitted for
        review.
      </Text>
      <Text style={text}>
        Slug: <code style={code}>{tutorSlug}</code>
      </Text>
      <Section style={buttonSection}>
        <Button href={adminUrl} style={button}>
          Review in admin panel
        </Button>
      </Section>
      <Text style={footer}>
        Log in to the admin panel to approve or reject this tutor application.
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

const code: React.CSSProperties = {
  backgroundColor: '#f1f5f9',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '14px',
  padding: '2px 6px',
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
