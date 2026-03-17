// Shared API type contracts used by both the UI and API agents.
// These match the interfaces documented in the project spec exactly.

export interface AddRequest {
  a: number;
  b: number;
}

export interface AddResponse {
  sum: number;
  id: string;
  created_at: string;
}

export interface HistoryResponse {
  history: AddResponse[];
}
