import axios from "axios";

if (!process.env.AMOCRM_DOMAIN || !process.env.AMOCRM_ACCESS_TOKEN) {
  throw new Error("Missing AmoCRM credentials");
}

const api = axios.create({
  baseURL: `https://${process.env.AMOCRM_DOMAIN}`,
  headers: {
    Authorization: `Bearer ${process.env.AMOCRM_ACCESS_TOKEN}`,
    "Content-Type": "application/json"
  }
});

export interface AmoCRMContact {
  id: number;
  name: string;
  phone: string;
  email?: string;
}

export interface AmoCRMLead {
  id: number;
  name: string;
  status_id: number;
  contact_id: number;
}

export async function createContact(contact: {
  name: string;
  phone: string;
  email?: string;
}): Promise<AmoCRMContact> {
  try {
    const response = await api.post("/api/v4/contacts", [{
      name: contact.name,
      custom_fields_values: [
        {
          field_id: "PHONE",
          values: [{ value: contact.phone }]
        },
        ...(contact.email ? [{
          field_id: "EMAIL",
          values: [{ value: contact.email }]
        }] : [])
      ]
    }]);

    return {
      id: response.data._embedded.contacts[0].id,
      name: contact.name,
      phone: contact.phone,
      email: contact.email
    };
  } catch (error) {
    throw new Error(`Failed to create AmoCRM contact: ${error.message}`);
  }
}

export async function createLead(data: {
  name: string;
  contactId: number;
  statusId: number;
}): Promise<AmoCRMLead> {
  try {
    const response = await api.post("/api/v4/leads", [{
      name: data.name,
      status_id: data.statusId,
      _embedded: {
        contacts: [{ id: data.contactId }]
      }
    }]);

    return {
      id: response.data._embedded.leads[0].id,
      name: data.name,
      status_id: data.statusId,
      contact_id: data.contactId
    };
  } catch (error) {
    throw new Error(`Failed to create AmoCRM lead: ${error.message}`);
  }
}

export async function updateLeadStatus(leadId: number, statusId: number): Promise<void> {
  try {
    await api.patch(`/api/v4/leads/${leadId}`, {
      status_id: statusId
    });
  } catch (error) {
    throw new Error(`Failed to update lead status: ${error.message}`);
  }
}
