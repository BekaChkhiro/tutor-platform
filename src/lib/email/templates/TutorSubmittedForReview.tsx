import { Heading, Link, Text } from '@react-email/components';
import * as React from 'react';
import { Layout } from './Layout';

export interface TutorSubmittedForReviewProps {
  tutorName: string;
  tutorEmail: string;
  adminUrl: string;
}

export function TutorSubmittedForReview({
  tutorName,
  tutorEmail,
  adminUrl,
}: TutorSubmittedForReviewProps) {
  return (
    <Layout preview={`New tutor application: ${tutorName}`}>
      <Heading style={{ fontSize: '24px', color: '#18181b', margin: '0 0 16px' }}>
        New tutor application
      </Heading>
      <Text style={{ color: '#3f3f46', fontSize: '16px', lineHeight: '24px', margin: '0 0 12px' }}>
        <strong>{tutorName}</strong> ({tutorEmail}) has submitted their tutor profile for review.
      </Text>
      <Text style={{ color: '#3f3f46', fontSize: '16px', lineHeight: '24px', margin: 0 }}>
        Review their application:{' '}
        <Link href={adminUrl} style={{ color: '#2563eb' }}>
          Open admin panel
        </Link>
      </Text>
    </Layout>
  );
}
