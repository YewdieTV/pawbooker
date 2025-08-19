import { Resend } from 'resend';
import { Twilio } from 'twilio';
import { format } from 'date-fns';
import { formatCurrency } from './utils';

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Twilio only if credentials are provided
const twilio = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

interface BookingEmailData {
  userEmail: string;
  userName: string;
  bookingId: string;
  serviceName: string;
  petName: string;
  startDateTime: Date;
  endDateTime: Date;
  price: number;
  status: string;
  notes?: string;
}

interface ReminderEmailData extends BookingEmailData {
  hoursUntil: number;
}

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@pawbooker.com',
      to: data.userEmail,
      subject: `Booking Confirmed: ${data.serviceName} for ${data.petName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Booking Confirmed!</h2>
          
          <p>Hi ${data.userName},</p>
          
          <p>Your booking has been confirmed. Here are the details:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">Booking Details</h3>
            <p><strong>Service:</strong> ${data.serviceName}</p>
            <p><strong>Pet:</strong> ${data.petName}</p>
            <p><strong>Date:</strong> ${format(data.startDateTime, 'EEEE, MMMM d, yyyy')}</p>
            <p><strong>Time:</strong> ${format(data.startDateTime, 'h:mm a')} - ${format(data.endDateTime, 'h:mm a')}</p>
            <p><strong>Total:</strong> ${formatCurrency(data.price)}</p>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
          </div>
          
          <h3>What's Next?</h3>
          <ul>
            <li>We'll send you a reminder 24 hours before your appointment</li>
            <li>Please ensure your pet's vaccination records are up to date</li>
            <li>Bring any special instructions or medications</li>
            <li>Arrive 5-10 minutes early for check-in</li>
          </ul>
          
          <h3>Contact Information</h3>
          <p>
            <strong>PawBooker</strong><br/>
            123 Dog Street, Toronto, ON M5V 3A8<br/>
            Phone: (416) 555-0123<br/>
            Email: hello@pawbooker.com
          </p>
          
          <p>We can't wait to take care of ${data.petName}!</p>
          
          <p>Best regards,<br/>The PawBooker Team</p>
        </div>
      `,
    });
    
    console.log(`Booking confirmation email sent to ${data.userEmail}`);
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
    throw error;
  }
}

export async function sendBookingReminderEmail(data: ReminderEmailData) {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@pawbooker.com',
      to: data.userEmail,
      subject: `Reminder: ${data.serviceName} for ${data.petName} tomorrow`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Appointment Reminder</h2>
          
          <p>Hi ${data.userName},</p>
          
          <p>This is a friendly reminder that you have a ${data.serviceName} appointment for ${data.petName} in ${data.hoursUntil} hours.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">Appointment Details</h3>
            <p><strong>Service:</strong> ${data.serviceName}</p>
            <p><strong>Pet:</strong> ${data.petName}</p>
            <p><strong>Date:</strong> ${format(data.startDateTime, 'EEEE, MMMM d, yyyy')}</p>
            <p><strong>Time:</strong> ${format(data.startDateTime, 'h:mm a')} - ${format(data.endDateTime, 'h:mm a')}</p>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
          </div>
          
          <h3>Reminders:</h3>
          <ul>
            <li>Please arrive 5-10 minutes early</li>
            <li>Bring any medications your pet needs</li>
            <li>Ensure vaccination records are current</li>
            <li>Let us know of any special instructions</li>
          </ul>
          
          <p>If you need to make any changes, please contact us at (416) 555-0123.</p>
          
          <p>We're looking forward to seeing you and ${data.petName}!</p>
          
          <p>Best regards,<br/>The PawBooker Team</p>
        </div>
      `,
    });
    
    console.log(`Booking reminder email sent to ${data.userEmail}`);
  } catch (error) {
    console.error('Failed to send booking reminder email:', error);
    throw error;
  }
}

export async function sendBookingCancellationEmail(data: BookingEmailData) {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@pawbooker.com',
      to: data.userEmail,
      subject: `Booking Cancelled: ${data.serviceName} for ${data.petName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Booking Cancelled</h2>
          
          <p>Hi ${data.userName},</p>
          
          <p>Your booking has been cancelled as requested. Here are the details:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">Cancelled Booking</h3>
            <p><strong>Service:</strong> ${data.serviceName}</p>
            <p><strong>Pet:</strong> ${data.petName}</p>
            <p><strong>Date:</strong> ${format(data.startDateTime, 'EEEE, MMMM d, yyyy')}</p>
            <p><strong>Time:</strong> ${format(data.startDateTime, 'h:mm a')} - ${format(data.endDateTime, 'h:mm a')}</p>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
          </div>
          
          <p>If you paid a deposit, it will be refunded to your original payment method within 5-7 business days.</p>
          
          <p>We're sorry we won't be able to take care of ${data.petName} this time. Feel free to book another appointment whenever you need our services!</p>
          
          <p>Best regards,<br/>The PawBooker Team</p>
        </div>
      `,
    });
    
    console.log(`Booking cancellation email sent to ${data.userEmail}`);
  } catch (error) {
    console.error('Failed to send booking cancellation email:', error);
    throw error;
  }
}

// SMS notifications (optional, only if Twilio is configured)
export async function sendBookingReminderSMS(phone: string, data: ReminderEmailData) {
  if (!twilio || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('Twilio not configured, skipping SMS reminder');
    return;
  }

  try {
    await twilio.messages.create({
      body: `Reminder: ${data.serviceName} for ${data.petName} tomorrow at ${format(data.startDateTime, 'h:mm a')}. PawBooker - (416) 555-0123`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    
    console.log(`Booking reminder SMS sent to ${phone}`);
  } catch (error) {
    console.error('Failed to send booking reminder SMS:', error);
    // Don't throw error for SMS failures as it's optional
  }
}

// Calendar invite generation
export function generateCalendarInvite(data: BookingEmailData): string {
  const start = data.startDateTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const end = data.endDateTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  
  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PawBooker//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${data.bookingId}@pawbooker.com`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${data.serviceName} - ${data.petName}`,
    `DESCRIPTION:${data.serviceName} appointment for ${data.petName}. Booking ID: ${data.bookingId}`,
    'LOCATION:123 Dog Street, Toronto, ON M5V 3A8',
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'DESCRIPTION:Reminder: Appointment tomorrow',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return icalContent;
}
