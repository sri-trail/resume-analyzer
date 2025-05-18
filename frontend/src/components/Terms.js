import React from 'react';
import { Typography, Box } from '@mui/material';

const Terms = () => {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Terms and Conditions
      </Typography>
      
      <Typography variant="body1" paragraph>
        Welcome to the AI Resume Analyzer app. By using this app, you agree to be bound by the following terms and conditions:
      </Typography>
      
      <Typography variant="body1" paragraph>
        1. <strong>Acceptance of Terms</strong>: By accessing and using the app, you agree to these terms. If you do not agree, please do not use the app.
      </Typography>
      
      <Typography variant="body1" paragraph>
        2. <strong>Use of Data</strong>: We collect resume data solely for the purpose of analysis and to improve your job application process. All data is handled in accordance with our <strong>Privacy Policy</strong>.
      </Typography>
      
      <Typography variant="body1" paragraph>
        3. <strong>Data Security</strong>: We use industry-standard security measures to protect your data. However, we cannot guarantee absolute security of any data transmitted over the internet.
      </Typography>
      
      <Typography variant="body1" paragraph>
        4. <strong>Limitation of Liability</strong>: We are not responsible for any errors, damages, or losses resulting from the analysis provided by this app. This includes, but is not limited to, effects on your job opportunities.
      </Typography>
      
      <Typography variant="body1" paragraph>
        5. <strong>Modifications</strong>: We reserve the right to modify these terms at any time. It is your responsibility to review these terms periodically. Continued use of the app indicates your acceptance of any changes.
      </Typography>
      
      <Typography variant="body1" paragraph>
        6. <strong>Governing Law</strong>: These terms are governed by the laws of the United States, and any disputes will be subject to the exclusive jurisdiction of U.S. courts.
      </Typography>
      
      <Typography variant="body1" paragraph>
        7. <strong>User Rights</strong>: You have the right to request access to, correction of, or deletion of your personal data in accordance with applicable data protection laws.
      </Typography>
      
      <Typography variant="body1" paragraph>
        By using the app, you agree to abide by these terms.
      </Typography>
    </Box>
  );
};

export default Terms;
