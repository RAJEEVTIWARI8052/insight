
export interface User {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
}

export interface Answer {
  id: string;
  author: User;
  content: string;
  upvotes: number;
  timestamp: string;
  isAI?: boolean;
  sources?: { title: string; uri: string }[];
}

export interface Question {
  id: string;
  title: string;
  content?: string;
  author: User;
  topic: string;
  timestamp: string;
  answers: Answer[];
  imageUrl?: string;
}

export interface Topic {
  id: string;
  name: string;
  icon: string;
}
