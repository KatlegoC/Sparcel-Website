// Email Service for sending booking confirmations
// Using Resend API (https://resend.com) - Free tier: 3,000 emails/month

interface BookingEmailData {
  bag_id: string;
  tracking_number: string;
  courier_company: string;
  tracking_link?: string;
  pickup_location: {
    name: string;
    address: string;
  };
  delivery_location: {
    name: string;
    address: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  recipient: {
    name: string;
    email: string;
    phone: string;
  };
  parcel_size: string;
  number_of_boxes: number;
}

// Email templates
const getCustomerEmailHTML = (data: BookingEmailData) => `
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

const getRecipientEmailHTML = (data: BookingEmailData) => `
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

// Send email using local Express server (to avoid CORS issues)
export const sendBookingConfirmationEmails = async (data: BookingEmailData): Promise<boolean> => {
  try {
    console.log('📧 Sending emails via local email server...');
    console.log('📧 Customer email:', data.customer.email);
    console.log('📧 Recipient email:', data.recipient.email);
    
    const response = await fetch('http://localhost:3001/send-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('📡 Email service response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to send emails. Status:', response.status);
      console.error('❌ Error details:', errorText);
      return false;
    }

    const result = await response.json();
    console.log('📧 Email service result:', result);
    
    if (result.success) {
      console.log('✅ Both emails sent successfully!');
      console.log('✅ Customer email sent:', result.customer_email_sent);
      console.log('✅ Recipient email sent:', result.recipient_email_sent);
      return true;
    } else {
      console.warn('⚠️ Some emails failed to send:', result.message);
      console.log('📧 Customer email sent:', result.customer_email_sent);
      console.log('📧 Recipient email sent:', result.recipient_email_sent);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending emails:', error);
    console.log('💡 Make sure the email server is running: npm run email-server');
    return false;
  }
};

// Export types
export type { BookingEmailData };

