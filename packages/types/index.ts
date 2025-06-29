export interface User {
  id: string;
  email: string;
  name: string;
  company_id: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
}

export interface Email {
  id: string;
  from: string;
  subject: string;
  status: string;
}
