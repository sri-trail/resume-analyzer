import React from 'react';
import { Typography, Box } from '@mui/material';

const Privacy = () => {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Privacy Policy
      </Typography>
      
      <Typography variant="body1" paragraph>
        At AI Resume Analyzer, we value your privacy. This Privacy Policy outlines how we collect, use, and protect your personal data.
      </Typography>
      
      <Typography variant="body1" paragraph>
        1. <strong>Data Collection</strong>: We collect resume data only when you upload it for analysis. This data is processed for the purpose of providing job application suggestions.
      </Typography>
      
      <Typography variant="body1" paragraph>
        2. <strong>Data Usage</strong>: The data you provide is used to analyze your resume, suggest improvements, and help you with job applications.
      </Typography>
      
      <Typography variant="body1" paragraph>
        3. <strong>Data Protection</strong>: We take all necessary measures to protect your data, including encryption and secure storage.
      </Typography>
      
      <Typography variant="body1" paragraph>
        4. <strong>Third-Party Sharing</strong>: We do not share your resume data with any third parties without your consent, unless required by law.
      </Typography>
      
      <Typography variant="body1" paragraph>
        5. <strong>Data Retention</strong>: We will retain your resume data only for as long as necessary to provide our services.
      </Typography>
      
      <Typography variant="body1" paragraph>
        6. <strong>User Rights</strong>: You have the right to request access to, correction of, or deletion of your personal data. Please contact us if you wish to exercise any of these rights.
      </Typography>
      
      <Typography variant="body1" paragraph>
        7. <strong>Cookies</strong>: This app may use cookies to improve the user experience. You can disable cookies in your browser settings if preferred.
      </Typography>
      
      <Typography variant="body1" paragraph>
        8. <strong>Changes to Privacy Policy</strong>: We may update this Privacy Policy from time to time. Any changes will be posted on this page, and the date of the most recent update will be indicated at the bottom of the page.
      </Typography>
      
      <Typography variant="body1" paragraph>
        9. <strong>Governing Law</strong>: This Privacy Policy is governed by the laws of the United States. Any disputes will be subject to the exclusive jurisdiction of the courts located in the United States.
      </Typography>
      
      <Typography variant="body1" paragraph>
        By using our app, you consent to the collection and use of your data in accordance with this Privacy Policy.
      </Typography>
    </Box>
  );
};

export default Privacy;
