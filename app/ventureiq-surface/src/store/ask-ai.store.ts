import { create } from "zustand";

import type { RagAnswer } from "@/lib/api/rag";

type AskAIState = {
  question: string;
  answer: RagAnswer | null;
  error: boolean;
  setQuestion: (question: string) => void;
  setAnswer: (answer: RagAnswer | null) => void;
  setError: (error: boolean) => void;
};

export const useAskAIStore = create<AskAIState>((set) => ({
  question: "",
  answer: null,
  error: false,
  setQuestion: (question) => set({ question }),
  setAnswer: (answer) => set({ answer }),
  setError: (error) => set({ error }),
}));
