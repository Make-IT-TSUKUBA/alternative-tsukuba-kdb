export type SubjectType = {
  name: string;
  children: SubjectType[] | string[];
};

export type UndergradTypes = {
  types: SubjectType[];
};
