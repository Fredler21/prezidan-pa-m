export type Lang = 'ht' | 'fr' | 'en';
export const LANGS: readonly Lang[] = ['ht', 'fr', 'en'];

export type L10n = Record<Lang, string>;
export type L10nList = Record<Lang, string[]>;

export type PriorityId =
  | 'security' | 'education' | 'infrastructure' | 'economy' | 'health' | 'agriculture'
  | 'justice' | 'utilities' | 'diaspora' | 'environment' | 'institutions' | 'youth';

export interface Priority {
  id: PriorityId;
  label: L10n;
}

export interface CandidateTag {
  id: PriorityId;
  /** One-line, sourced reason this priority is on the candidate's public record. */
  note: L10n;
}

export interface Source {
  label: string;
  url: string;
  /** ISO date the source was consulted, e.g. "2026-10-30". */
  date?: string;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  partyFull: string;
  /** Short current/last office line shown under the party. */
  role?: L10n;
  bio: L10n;
  /** "On the record" bullets. Empty for candidates with limited public information. */
  record: L10nList;
  /** Former heads of state only: what they did during their term. */
  term?: { title: L10n; items: L10nList };
  /** Priorities with a documented public record. Empty = "Platform not yet published". */
  tags: CandidateTag[];
  sources: Source[];
  /** Path under /photos/, e.g. "martelly.jpg". Absent = monogram avatar. */
  photo?: string;
  photoCredit?: string;
  /** Candidacy status note when the CEP registration is contested or under review. */
  status?: L10n;
}

export type DepartmentId =
  | 'ouest' | 'sud-est' | 'nord' | 'nord-est' | 'artibonite' | 'centre' | 'sud'
  | 'grand-anse' | 'nord-ouest' | 'nippes' | 'dyaspora' | 'na';

export interface Department {
  id: DepartmentId;
  label: L10n;
}

export interface KeyDate {
  date: string; // ISO
  label: L10n;
}

export interface Vote {
  candidate: string;
  reason: string;
  department: DepartmentId;
  priorities: PriorityId[];
  lang: Lang;
}

export interface ReasonEntry {
  text: string;
  department: DepartmentId;
  /** epoch ms */
  at: number;
}

export interface Results {
  total: number;
  counts: Record<string, number>;
  reasons: ReasonEntry[];
  /** epoch ms of the last refresh */
  updatedAt: number;
}

export interface PollOption {
  id: string;
  label: L10n;
}

export interface Poll {
  id: string;
  week: string; // e.g. "2026-W44"
  question: L10n;
  options: PollOption[];
  startsAt: number; // epoch ms
  endsAt: number;
  active: boolean;
}

export interface PollResults {
  total: number;
  counts: Record<string, number>;
}

export type StorageMode = 'local' | 'firebase';

/**
 * Storage adapter. The UI only talks to this interface so the backend can be
 * swapped (localStorage demo mode, Firebase, or anything else).
 */
export interface StorageAdapter {
  readonly mode: StorageMode;
  /** Resolves the current user id (anonymous or phone-verified). */
  ready(): Promise<void>;
  getMyVote(): Promise<Vote | null>;
  saveVote(vote: Vote): Promise<void>;
  /** Pushes aggregated results now and whenever they change. Returns unsubscribe. */
  subscribeVotes(callback: (results: Results) => void): () => void;

  getActivePoll(): Promise<Poll | null>;
  getPastPolls(limit?: number): Promise<Poll[]>;
  getMyPollAnswer(pollId: string): Promise<string | null>;
  savePollAnswer(pollId: string, optionId: string): Promise<void>;
  subscribePollResults(pollId: string, callback: (r: PollResults) => void): () => void;
}
