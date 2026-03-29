export interface AnyAction {
  title: string;
  kind?: { value: string };
  isPreferred?: boolean;
}
