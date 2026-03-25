
export interface User {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  role?: 'user' | 'expert';
  experience?: number;
  expertise?: string[];
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
  _id?: string;
  title: string;
  content?: string;
  author: User;
  topic: string;
  timestamp: string;
  createdAt?: string;
  answers: Answer[];
  responses?: { _id?: string; text: string; author: User; createdAt?: string }[];
  upvotes?: any[];
  imageUrl?: string;
  category?: string;
  expertResponse?: string;
  status?: 'open' | 'answered' | 'closed';
  mentionedExpertId?: string;
}

export interface Topic {
  id: string;
  name: string;
  icon: string;
}
