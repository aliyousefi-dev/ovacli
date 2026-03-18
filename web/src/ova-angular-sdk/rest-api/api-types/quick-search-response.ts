export interface QuickSearchResultItem {
  type: string;
  label: string;
}

export interface QuickSearchResponse {
  query: string;
  results: QuickSearchResultItem[];
}
