import twilio from "twilio";

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  throw new Error("Missing required Twilio credentials");
}

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export interface CallResult {
  sid: string;
  status: string;
  duration: number;
  recordingUrl?: string;
}

export async function makeCall(to: string, fromNumber: string): Promise<CallResult> {
  try {
    const call = await client.calls.create({
      to,
      from: fromNumber,
      twiml: '<Response><Say>Hello, this is an automated call.</Say></Response>',
      record: true,
    });

    return {
      sid: call.sid,
      status: call.status,
      duration: call.duration || 0,
      recordingUrl: call.recordingUrl,
    };
  } catch (error) {
    throw new Error(`Failed to initiate call: ${error.message}`);
  }
}

export async function getCallStatus(callSid: string): Promise<string> {
  try {
    const call = await client.calls(callSid).fetch();
    return call.status;
  } catch (error) {
    throw new Error(`Failed to get call status: ${error.message}`);
  }
}

export async function getRecording(callSid: string): Promise<string | undefined> {
  try {
    const recordings = await client.recordings.list({ callSid });
    return recordings[0]?.uri;
  } catch (error) {
    throw new Error(`Failed to get recording: ${error.message}`);
  }
}
