
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthday: string; // "YYYY-MM-DD"
  anniversary: string; // "YYYY-MM-DD"
}

export interface Event {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  description: string;
  attendance: string[]; // Array of member IDs
}
