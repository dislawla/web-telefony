import axios from "axios";

// Temporarily disable credential check
// if (!process.env.AMOCRM_DOMAIN || !process.env.AMOCRM_ACCESS_TOKEN) {
//   throw new Error("Missing AmoCRM credentials");
// }

function getApi() {
  const domain = process.env.AMOCRM_DOMAIN;
  const token = process.env.AMOCRM_ACCESS_TOKEN;

  if (!domain || !token) {
    throw new Error("AmoCRM credentials not configured");
  }

  return axios.create({
    baseURL: `https://${domain}`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
}

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
    const api = getApi();
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
    if (error instanceof Error) {
      throw new Error(`Не удалось создать контакт в AmoCRM: ${error.message}`);
    }
    throw error;
  }
}

export async function createLead(data: {
  name: string;
  contactId: number;
  statusId: number;
}): Promise<AmoCRMLead> {
  try {
    const api = getApi();
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
    if (error instanceof Error) {
      throw new Error(`Не удалось создать сделку в AmoCRM: ${error.message}`);
    }
    throw error;
  }
}

export async function updateLeadStatus(leadId: number, statusId: number): Promise<void> {
  try {
    const api = getApi();
    await api.patch(`/api/v4/leads/${leadId}`, {
      status_id: statusId
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Не удалось обновить статус сделки: ${error.message}`);
    }
    throw error;
  }
}