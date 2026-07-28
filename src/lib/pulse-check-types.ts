import type { ContactFormValues } from "@/components/PulseCheck/schema";
import type { Track } from "@/components/PulseCheck/constants";

export type PulseCheckAnswer = {
  eyebrow: string;
  question: string;
  answer: string | undefined;
  score: number | undefined;
};

export type PulseCheckPayload = {
  contact: ContactFormValues;
  answers: PulseCheckAnswer[];
  depAvg: number;
  urgAvg: number;
  overall: number;
  track: Track;
  hotLead: boolean;
};
