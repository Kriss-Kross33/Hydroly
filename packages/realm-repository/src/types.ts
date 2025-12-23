import { Realm } from "realm";

export type RealmContextType = {
  realm: Realm | null;
  isLoading: boolean;
  error: Error | null;
};

export type RealmInstance = Realm;
