export type EventMember = {
  type: string;
  member: Member;
  docId: number;
};

export type Member = {
  role: string;
  id: number;
  name: string;
};
