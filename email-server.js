// Simple Express server to handle email sending (avoids CORS issues)
// Run this alongside your Vite dev server

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Your Resend API key
const RESEND_API_KEY = 're_E66hrzkF_By4ZS4xMgPAKdc7x5yAD1JAj';

// Email templates (same as in the frontend)
const getCustomerEmailHTML = (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #FF5823 0%, #FF6B35 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #FF5823; }
    .button { display: inline-block; background: #FF5823; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    h2 { color: #FF5823; margin-top: 0; }
    .highlight { background: #fff3e0; padding: 15px; border-radius: 5px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Booking Confirmed!</h1>
      <p style="font-size: 18px; margin: 10px 0;">Your parcel journey is all set</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>📦 Booking Details</h2>
        <p><strong>Bag ID:</strong> ${data.bag_id}</p>
        <p><strong>Tracking Number:</strong> ${data.tracking_number}</p>
        <p><strong>Courier:</strong> ${data.courier_company}</p>
        ${data.tracking_link ? `<p><a href="${data.tracking_link}" class="button">Track Your Parcel</a></p>` : ''}
      </div>
      
      <div class="highlight">
        <h3 style="margin-top: 0;">📍 NEXT STEP - Drop Off Your Parcel</h3>
        <p><strong>Please take your parcel to:</strong></p>
        <p style="font-size: 16px; margin: 10px 0;">
          <strong>${data.pickup_location.name}</strong><br>
          ${data.pickup_location.address}
        </p>
        <p style="color: #FF5823; font-weight: bold;">✅ Your parcel is booked for collection at this pickup point</p>
      </div>
      
      <div class="section">
        <h2>📍 Delivery Details</h2>
        <p><strong>Delivering to:</strong></p>
        <p style="font-size: 16px;">
          <strong>${data.delivery_location.name}</strong><br>
          ${data.delivery_location.address}
        </p>
        <p><strong>Recipient:</strong> ${data.recipient.name}</p>
        <p><strong>Contact:</strong> ${data.recipient.phone}</p>
      </div>
      
      <div class="section">
        <h2>📋 Parcel Information</h2>
        <p><strong>Size:</strong> ${data.parcel_size.toUpperCase()}</p>
        <p><strong>Number of Boxes:</strong> ${data.number_of_boxes}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 14px; color: #666;">Need help? Contact us or visit our website</p>
      </div>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Sparcel. Making parcel delivery simple for townships.</p>
      <p>This is an automated confirmation email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

const getRecipientEmailHTML = (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #FF5823 0%, #FF6B35 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #FF5823; }
    .button { display: inline-block; background: #FF5823; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    h2 { color: #FF5823; margin-top: 0; }
    .highlight { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Parcel On The Way!</h1>
      <p style="font-size: 18px; margin: 10px 0;">A parcel is being sent to you</p>
    </div>
    
    <div class="content">
      <div class="highlight">
        <h3 style="margin-top: 0;">Hi ${data.recipient.name},</h3>
        <p><strong>${data.customer.name}</strong> has sent you a parcel via Sparcel!</p>
      </div>
      
      <div class="section">
        <h2>📦 Tracking Information</h2>
        <p><strong>Tracking Number:</strong> ${data.tracking_number}</p>
        <p><strong>Courier:</strong> ${data.courier_company}</p>
        ${data.tracking_link ? `<p><a href="${data.tracking_link}" class="button">Track Your Parcel</a></p>` : ''}
      </div>
      
      <div class="section">
        <h2>📍 Delivery Location</h2>
        <p><strong>Your parcel will be delivered to:</strong></p>
        <p style="font-size: 16px;">
          <strong>${data.delivery_location.name}</strong><br>
          ${data.delivery_location.address}
        </p>
        <p style="color: #FF5823; font-weight: bold;">✅ You'll be notified when it arrives!</p>
      </div>
      
      <div class="section">
        <h2>📋 Parcel Details</h2>
        <p><strong>Size:</strong> ${data.parcel_size.toUpperCase()}</p>
        <p><strong>Number of Boxes:</strong> ${data.number_of_boxes}</p>
        <p><strong>Sender:</strong> ${data.customer.name} (${data.customer.phone})</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 14px; color: #666;">Questions? Contact the sender at ${data.customer.phone}</p>
      </div>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Sparcel. Making parcel delivery simple for townships.</p>
      <p>This is an automated notification email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

// Email sending endpoint
app.post('/send-emails', async (req, res) => {
  try {
    const data = req.body;
    
    console.log('📧 Received email request for booking:', data.bag_id);
    console.log('📧 Customer email:', data.customer.email);
    console.log('📧 Recipient email:', data.recipient.email);

    // Send customer email
    const customerEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Sparcel <onboarding@resend.dev>',
        to: [data.customer.email],
        subject: `✅ Booking Confirmed - ${data.bag_id}`,
        html: getCustomerEmailHTML(data),
      }),
    });

    let customerEmailSuccess = false;
    if (customerEmailResponse.ok) {
      const responseData = await customerEmailResponse.json();
      console.log('✅ Customer email sent successfully:', responseData.id);
      customerEmailSuccess = true;
    } else {
      const errorText = await customerEmailResponse.text();
      console.error('❌ Failed to send customer email:', errorText);
    }

    // Send recipient email
    console.log('📧 Attempting to send recipient email to:', data.recipient.email);
    const recipientEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Sparcel <onboarding@resend.dev>',
        to: [data.recipient.email],
        subject: `📦 Parcel On The Way - ${data.tracking_number}`,
        html: getRecipientEmailHTML(data),
      }),
    });

    console.log('📧 Recipient email response status:', recipientEmailResponse.status);
    let recipientEmailSuccess = false;
    if (recipientEmailResponse.ok) {
      const responseData = await recipientEmailResponse.json();
      console.log('✅ Recipient email sent successfully:', responseData.id);
      recipientEmailSuccess = true;
    } else {
      const errorText = await recipientEmailResponse.text();
      console.error('❌ Failed to send recipient email. Status:', recipientEmailResponse.status);
      console.error('❌ Error details:', errorText);
    }

    res.json({
      success: customerEmailSuccess && recipientEmailSuccess,
      customer_email_sent: customerEmailSuccess,
      recipient_email_sent: recipientEmailSuccess,
      message: customerEmailSuccess && recipientEmailSuccess 
        ? 'Both emails sent successfully' 
        : 'Some emails failed to send'
    });

  } catch (error) {
    console.error('❌ Error in email server:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Email server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Email server running on http://localhost:${PORT}`);
  console.log(`📧 Email endpoint: http://localhost:${PORT}/send-emails`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

export default app;
