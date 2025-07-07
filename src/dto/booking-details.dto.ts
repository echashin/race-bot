interface Client {
  id: number;
  nickname: string;
  dob: string;
  roles: string[];
  creator: null | { id: number; name: string };
  login: string;
  phone: string;
  email: string | null;
  phone_suffix: string;
  country_code: string;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  deposit: number;
}

export interface BookingDetails {
  id: number;
  hosts: number[];
  client: Client;
  from: string;
  to: string;
  comment: string | null;
  status: string;
  startsIn: number;
  group: string;
}
