import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Receipt, ReceiptStatus, Priest } from '../types';

// This check was removed as it crashes the app on deployment.
// The environment is expected to provide the API key.
// if (!process.env.API_KEY) {
//   throw new Error("API_KEY environment variable not set");
// }

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const receiptSchema = {
  type: Type.OBJECT,
  properties: {
    devoteeName: { type: Type.STRING, description: "The name of the devotee making the offering or donation." },
    offeringDate: { type: Type.STRING, description: "The date of the offering, in YYYY-MM-DD format. Assume today if not specified." },
    mobileNumber: { type: Type.STRING, description: "The devotee's mobile number for sending a confirmation." },
    items: {
      type: Type.ARRAY,
      description: "A list of offerings or poojas.",
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "Description of the pooja or donation (e.g., 'Archana', 'Donation for Annadanam')." },
          amount: { type: Type.NUMBER, description: "The amount of the offering." },
        },
        required: ["description", "amount"],
      },
    },
    notes: { type: Type.STRING, description: "Any specific notes or requests from the devotee (e.g., 'in the name of...')." },
  },
  required: ["devoteeName", "offeringDate", "items"],
};

const priestSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        role: { type: Type.STRING, description: "The role of the person (e.g., 'Head Priest', 'Sevadar', 'Temple Staff')." },
        specialty: { type: Type.STRING, description: "Any special skills or duties (e.g., 'Nadaswaram Vidwan', 'Prasadam Preparation')." },
        contactPerson: { type: Type.STRING, description: "Primary contact name (can be the person themselves)." },
        contactEmail: { type: Type.STRING },
        contactPhone: { type: Type.STRING },
        addressLine1: { type: Type.STRING },
        city: { type: Type.STRING },
        state: { type: Type.STRING },
        pincode: { type: Type.STRING },
    },
    required: ["name", "role", "contactPhone", "city"],
};

// --- AI Chat Tools ---
const createReceiptTool: FunctionDeclaration = { name: 'createReceipt', description: 'Creates a new receipt for a pooja or donation.', parameters: receiptSchema };
const createPriestTool: FunctionDeclaration = { name: 'createPriest', description: 'Adds a new priest, sevadar, or staff member to the temple records.', parameters: priestSchema };
const getReceiptDetailsTool: FunctionDeclaration = { name: 'getReceiptDetails', description: 'Retrieves detailed information about an existing receipt using its number or the devotee\'s name.', parameters: { type: Type.OBJECT, properties: { receiptNumber: { type: Type.STRING }, devoteeName: { type: Type.STRING } } } };
const getReceiptsByMonthTool: FunctionDeclaration = { name: 'getReceiptsByMonth', description: 'Retrieves a list of all receipts for a specific month and year.', parameters: { type: Type.OBJECT, properties: { year: { type: Type.NUMBER }, month: { type: Type.STRING } }, required: ["year", "month"] } };
const sendConfirmationTool: FunctionDeclaration = { name: 'sendConfirmation', description: 'Prepares a WhatsApp confirmation message for a specific receipt. The user will be asked to confirm before sending.', parameters: { type: Type.OBJECT, properties: { receiptNumber: { type: Type.STRING } }, required: ["receiptNumber"] } };
const sendSmsTool: FunctionDeclaration = { name: 'sendSms', description: 'Prepares a standard SMS message for a specific receipt to a given mobile number. Use this for "message" or "SMS", not WhatsApp.', parameters: { type: Type.OBJECT, properties: { receiptNumber: { type: Type.STRING, description: "The receipt number to send the message for." }, mobileNumber: { type: Type.STRING, description: "The mobile number to send the SMS to." } }, required: ["receiptNumber", "mobileNumber"] } };

// Helper for consistent currency formatting
const formatCurrency = (amount: number): string => `₹${amount.toLocaleString('en-IN')}`;

type AiAction = 
    { type: 'receipt_draft', data: Partial<Receipt> } |
    { type: 'priest_draft', data: Partial<Priest> } |
    { type: 'send_confirmation', receipt: Receipt } |
    { type: 'send_sms', receipt: Receipt, mobileNumber: string, message: string };

export const getAiChatResponse = async (prompt: string, receipts: Receipt[], priests: Priest[]): Promise<{text: string, action?: AiAction}> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Today is ${new Date().toISOString().split('T')[0]}. User prompt: "${prompt}"`,
            config: {
                tools: [{ functionDeclarations: [
                    createReceiptTool, 
                    createPriestTool,
                    getReceiptDetailsTool,
                    getReceiptsByMonthTool,
                    sendConfirmationTool,
                    sendSmsTool
                ] }],
                systemInstruction: `நீங்கள் ஒரு தமிழ்நாட்டு கோவிலின் உதவியாளராக இருக்கிறீர்கள். உங்கள் பெயர் 'கோவில் உதவியாளர்'. நீங்கள் பக்தர்களுக்கு ரசீதுகள் மற்றும் கோவில் ஊழியர்களை நிர்வகிக்க உதவ வேண்டும்.

- **பேச்சு**: எப்போதும் höflich மற்றும் கோவிலுக்கு ஏற்ற மரியாதையான மொழியைப் பயன்படுத்தவும்.
- **ரசீதுகள்/குருக்கள் உருவாக்குதல்**: 'createReceipt' அல்லது 'createPriest' கருவிகளைப் பயன்படுத்தவும். விவரங்கள் இல்லை என்றால், höflich கேட்கவும்.
- **தகவல்களைப் பெறுதல்**: ரசீதுகளைக் கண்டுபிடிக்க 'getReceiptDetails' (எண் அல்லது பக்தர் பெயர் மூலம்) அல்லது 'getReceiptsByMonth' பயன்படுத்தவும்.
- **செயல்கள்**: பயனர் ஒரு பூஜை அல்லது நன்கொடைக்கு WhatsApp மூலம் அறிவிப்பு அனுப்ப விரும்பினால், 'sendConfirmation' பயன்படுத்தவும். பயனர் ஒரு సాధారణ SMS அல்லது 'message' அனுப்ப விரும்பினால், 'sendSms' கருவியைப் பயன்படுத்தவும்.
- மற்ற கேள்விகளுக்கு, கோவில் நடவடிக்கைகள் பற்றி உரையாடலில் பதிலளிக்கவும்.`
            }
        });
        
        const functionCall = response.functionCalls?.[0];

        if (functionCall) {
            switch(functionCall.name) {
                case 'createReceipt': {
                    const receiptData = functionCall.args as Omit<Receipt, 'id' | 'receiptNumber' | 'status'>;
                    const itemsWithIds = receiptData.items.map(item => ({ ...item, id: `temp-${Math.random().toString(36).substr(2, 9)}` }));
                    return { text: 'காணிக்கை விவரங்கள் என்னிடம் உள்ளன. ரசீதை உருவாக்க, சரிபார்த்து உறுதிப்படுத்தவும்.', action: { type: 'receipt_draft', data: { ...receiptData, items: itemsWithIds, status: ReceiptStatus.Draft } } };
                }
                case 'createPriest': {
                    const priestData = functionCall.args as Omit<Priest, 'id' | 'joinedDate'>;
                     return { text: 'புதிய நபரின் விவரங்கள் என்னிடம் உள்ளன. பதிவுகளில் சேர்க்க, சரிபார்த்து உறுதிப்படுத்தவும்.', action: { type: 'priest_draft', data: priestData } };
                }
                case 'sendConfirmation': {
                    const { receiptNumber } = functionCall.args;
                    const receipt = receipts.find(r => r.receiptNumber.toLowerCase() === receiptNumber?.toLowerCase());
                     if (receipt) {
                        if (!receipt.mobileNumber) {
                            return { text: `மன்னிக்கவும், ${receiptNumber} என்ற ரசீது எண்ணுடன் மொபைல் எண் இணைக்கப்படவில்லை.` };
                        }
                        return { 
                            text: `${receipt.receiptNumber} ரசீதுக்கான உறுதிப்படுத்தல் செய்தியை அனுப்ப, கீழே உள்ள பொத்தானை கிளிக் செய்யவும்.`,
                            action: { type: 'send_confirmation', receipt }
                        };
                    }
                    return { text: `மன்னிக்கவும், ${receiptNumber} என்ற ரசீதை என்னால் கண்டுபிடிக்க முடியவில்லை.` };
                }
                case 'sendSms': {
                    const { receiptNumber, mobileNumber } = functionCall.args;
                    if (!receiptNumber || !mobileNumber) {
                        return { text: "மன்னிக்கவும், SMS அனுப்ப எனக்கு ரசீது எண் மற்றும் மொபைல் எண் இரண்டும் தேவை." };
                    }
                    const receipt = receipts.find(r => r.receiptNumber.toLowerCase() === receiptNumber.toLowerCase());
                    if (receipt) {
                        const total = receipt.items.reduce((sum, item) => sum + item.amount, 0);
                        const itemsList = receipt.items.map(item => `- ${item.description} (₹${item.amount.toLocaleString('en-IN')})`).join('\n');
                        const message = `Vanakam from Arulmigu Angala Parameswari Temple. Thank you, ${receipt.devoteeName}! We have received your offering. Receipt No: ${receipt.receiptNumber}. Seva(s): ${itemsList.replace(/\n/g, ', ')}. Total: ₹${total.toLocaleString('en-IN')}.`;
                        
                        const responseText = `${receipt.receiptNumber} ரசீதுக்கான SMS செய்தி தயாராக உள்ளது. அதை ${mobileNumber} என்ற எண்ணிற்கு அனுப்ப, கீழே உள்ள பொத்தானை கிளிக் செய்யவும்.\n\n**முக்கியம்:** உங்கள் செய்தியிடல் செயலி திறக்கும், அங்கு நீங்கள் செய்தியை மதிப்பாய்வு செய்து நீங்களே அனுப்ப வேண்டும்.`;
                        
                        return { 
                            text: responseText,
                            action: { type: 'send_sms', receipt, mobileNumber, message }
                        };
                    }
                    return { text: `மன்னிக்கவும், ${receiptNumber} என்ற ரசீதை என்னால் கண்டுபிடிக்க முடியவில்லை.` };
                }
                case 'getReceiptsByMonth': {
                    const { year, month } = functionCall.args as { year: number, month: string };
                    const monthIndex = new Date(`${month} 1, 2000`).getMonth();
                    const found = receipts.filter(r => { const d = new Date(r.offeringDate); return d.getFullYear() === year && d.getMonth() === monthIndex; });
                    if (found.length > 0) {
                        const list = found.map(r => `• ${r.receiptNumber} (${r.devoteeName}) - ${formatCurrency(r.items.reduce((s, i) => s + i.amount, 0))}`).join('\n');
                        const text = `${month} ${year} மாதத்தில் ${found.length} ரசீது(கள்) கிடைத்தன:\n\n${list}\n\nரசீது எண்ணைக் கொடுத்து இவற்றைப் பற்றிய விரிவான தகவல்களைக் கேட்கலாம்.`;
                        return { text };
                    }
                    return { text: `${month} ${year} மாதத்தில் எந்த ரசீதும் இல்லை.` };
                }

                case 'getReceiptDetails': {
                    const { receiptNumber, devoteeName } = functionCall.args;
                    const found = receipts.find(r => (receiptNumber && r.receiptNumber.toLowerCase() === receiptNumber.toLowerCase()) || (devoteeName && r.devoteeName.toLowerCase().includes(devoteeName.toLowerCase())));
                    if (found) {
                        const total = found.items.reduce((s, i) => s + i.amount, 0);
                        const itemsSummary = found.items.map(item => `• ${item.description} – ${formatCurrency(item.amount)}`).join('\n');
                        const dateOpts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
                        const offeringDate = new Date(found.offeringDate).toLocaleDateString('en-GB', dateOpts).replace(/ /g, '-');
                        
                        const data = `Receipt: ${found.receiptNumber}, Devotee: ${found.devoteeName}, Date: ${offeringDate}, Items: [${itemsSummary}], Total: ${formatCurrency(total)}, Status: ${found.status}`;
                        
                        const formatResponse = await ai.models.generateContent({
                            model: 'gemini-2.5-flash',
                            contents: `Format this data: "${data}" into this template: "🙏 ரசீது விவரங்கள் – [Receipt Number] 🙏\n\n🧾 ரசீது எண்: [Receipt Number]\n👤 பக்தர் பெயர்: [Devotee Name]\n\n🗓️ காணிக்கை நாள்: [Date]\n\n🌺 காணிக்கைகள்:\n[Items List]\n\n💰 மொத்த தொகை: [Total Amount]\n\n✅ நிலை: [Status]"`,
                            config: { systemInstruction: "You are an expert text formatter for a temple. Precisely follow the user's template, including all emojis and markdown." }
                        });
                        return { text: formatResponse.text.trim() };
                    }
                    return { text: "மன்னிக்கவும், இந்த தகவலுடன் பொருந்தும் ரசீதுகள் எதுவும் இல்லை." };
                }
            }
        }
        return { text: response.text.trim() };
    } catch (error) {
        console.error("Error in AI chat response:", error);
        return { text: "மன்னிக்கவும், ஒரு பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்." };
    }
};