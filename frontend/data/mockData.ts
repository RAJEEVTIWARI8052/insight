
import { Question, Topic, User } from '../types';

export const currentUser: User = {
  id: 'u1',
  name: 'Alex Rivera',
  avatar: 'https://picsum.photos/seed/cyber1/100/100',
  bio: 'Security Researcher | Malware Analyst'
};

export const topics: Topic[] = [
  { id: 't1', name: 'Malware Analysis', icon: 'fa-virus-slash' },
  { id: 't2', name: 'Network Security', icon: 'fa-network-wired' },
  { id: 't3', name: 'Penetration Testing', icon: 'fa-user-secret' },
  { id: 't4', name: 'Cryptography', icon: 'fa-key' },
  { id: 't5', name: 'DevSecOps', icon: 'fa-infinity' },
  { id: 't6', name: 'Web Exploitation', icon: 'fa-bug' },
  { id: 't7', name: 'Incident Response', icon: 'fa-shield-halved' },
];

export const initialQuestions: Question[] = [
  {
    id: 'q1',
    title: 'How do recent kernel-level anti-cheat systems affect system security?',
    content: 'With more games moving to Ring 0 drivers for anti-cheat, what are the potential attack vectors for malware to exploit these signed drivers?',
    topic: 'Malware Analysis',
    author: {
      id: 'u2',
      name: 'ZeroDay Hunter',
      avatar: 'https://picsum.photos/seed/hacker1/100/100',
    },
    timestamp: '1 hour ago',
    imageUrl: 'https://picsum.photos/seed/kernel/800/400',
    answers: [
      {
        id: 'a1',
        author: {
          id: 'u3',
          name: 'SysInternals Fan',
          avatar: 'https://picsum.photos/seed/admin/100/100',
        },
        content: 'The primary concern is the BYOVD (Bring Your Own Vulnerable Driver) technique. Even if the anti-cheat is signed, if it has a vulnerability, it gives an attacker high-privilege access...',
        upvotes: 45,
        timestamp: '30 mins ago',
      }
    ]
  },
  {
    id: 'q2',
    title: 'What are the best resources for learning about post-quantum cryptography?',
    content: 'I am looking for practical implementations of NIST-approved algorithms like Kyber.',
    topic: 'Cryptography',
    author: {
      id: 'u4',
      name: 'CryptoPunks',
      avatar: 'https://picsum.photos/seed/crypto/100/100',
    },
    timestamp: '4 hours ago',
    answers: []
  }
];

