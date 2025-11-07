import { Receipt } from '../types';

/**
 * Normalizes a phone number to include the Indian country code for WhatsApp.
 * This function is designed to handle various formats of Indian mobile numbers.
 * @param phone The phone number string.
 * @returns A cleaned phone number with the country code, suitable for WhatsApp URLs.
 */
const normalizePhoneNumberForWhatsApp = (phone: string): string => {
  // Remove all non-digit characters to get a clean number string.
  let cleanPhone = phone.replace(/[^0-9]/g, '');

  // If the number already starts with '91' and is 12 digits long, it's likely a valid Indian number.
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    return cleanPhone;
  }

  // If the number starts with a '0' (common for local dialing), remove it.
  if (cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.substring(1);
  }

  // If the number is 10 digits long (the standard for Indian mobiles), prepend the country code '91'.
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }
  
  // Return the processed number. It may still be invalid if the original input was incorrect.
  return cleanPhone;
};

/**
 * Prepares and opens a WhatsApp message in a new tab.
 * @param phone The target phone number.
 * @param receipt The receipt object for message content.
 */
export const sendWhatsAppMessage = (phone: string, receipt: Receipt) => {
  const cleanPhone = normalizePhoneNumberForWhatsApp(phone);

  // Add validation to ensure the phone number is likely valid before proceeding.
  if (!cleanPhone || cleanPhone.length < 12) { // Indian numbers with country code '91' are 12 digits.
    alert(`The phone number "${phone}" appears to be be invalid. Please provide a valid 10-digit Indian mobile number.`);
    return;
  }

  // The user already clicked a "Send Confirmation" button.
  // The window.confirm() call was removed because it interrupts the user action flow, 
  // causing browsers' pop-up blockers to trigger.
  const total = receipt.items.reduce((sum, item) => sum + item.amount, 0);
  const itemsList = receipt.items.map(item => `- ${item.description} (₹${item.amount.toLocaleString('en-IN')})`).join('\n');

  const message = encodeURIComponent(
`🙏 Vanakam from Arulmigu Angala Parameswari Temple 🙏

Thank you, ${receipt.devoteeName}! We have received your offering.

🧾 Receipt No: ${receipt.receiptNumber}
🌺 Seva(s):
${itemsList}
---
💰 Total Amount: ₹${total.toLocaleString('en-IN')}

May the blessings of the deity be with you and your family.`
  );
  
  const url = `https://wa.me/${cleanPhone}?text=${message}`;
  
  // Open the new window and check if it was blocked
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
    // This is the best way to check for a popup blocker
    alert('Popup blocked! Please allow popups for this site to send WhatsApp messages.');
  }
};

/**
 * Initiates sending an SMS by opening the user's default messaging app.
 * This uses the 'sms:' URI scheme, which is widely supported on mobile devices.
 * @param phone The target phone number.
 * @param message The text message to be sent.
 */
export const sendSmsMessage = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const smsUri = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
  
  console.log(`Attempting to open SMS URI: ${smsUri}`);
  
  // This will attempt to open the user's default SMS application.
  // This is the standard way to initiate sending an SMS from a web page without a backend.
  window.location.href = smsUri;
};