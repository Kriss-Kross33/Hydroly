import { LocalStorageApi } from "@hydroly/local-storage-api";
import { Realm } from "realm";

export interface RealmRepositoryConfig<T extends Record<string, any>> {
  /**
   * Realm configuration. The caller is responsible for providing the schema.
   */
  // Typed as `any` here to avoid coupling to a specific Realm type definition.
  // In practice, pass a standard `Realm.Configuration` object.
  realmConfig: any;
  /**
   * The Realm object type name, e.g. "Farm" or "User".
   */
  objectType: string;
  /**
   * The property on T that represents the primary key. Defaults to "id".
   */
  idKey?: keyof T & string;
}

export interface SyncHandlers<T extends Record<string, any>> {
  /**
   * Fetch the latest objects from your backend.
   */
  fetchRemote: () => Promise<T[]>;
  /**
   * Optional: push the current local objects to your backend after merge.
   */
  pushLocalChanges?: (items: T[]) => Promise<void>;
  /**
   * Optional: custom merge strategy between local and remote objects.
   * By default, the remote object overwrites local state.
   */
  merge?: (local: T | null, remote: T) => T;
}

/**
 * Generic Realm-backed key/value storage that implements LocalStorageApi
 * and adds typed helpers + sync support for any object type T.
 *
 * - Keys map to the primary key of the Realm object (idKey).
 * - Values are stored as JSON strings for compatibility with LocalStorageApi.
 */
export class RealmRepository<
  T extends Record<string, any>,
> extends LocalStorageApi {
  private readonly objectType: string;
  private readonly idKey: string;
  private readonly realmPromise: Promise<Realm>;

  constructor(config: RealmRepositoryConfig<T>) {
    super();
    this.objectType = config.objectType;
    this.idKey = config.idKey ?? "id";
    this.realmPromise = Realm.open(config.realmConfig);
  }

  private async getRealm(): Promise<Realm> {
    return this.realmPromise;
  }

  // ---- LocalStorageApi (string-based) implementation ----

  async getItem(key: string): Promise<string | null> {
    const realm = await this.getRealm();
    const obj = realm.objectForPrimaryKey<T & Realm.Object>(
      this.objectType,
      key
    );
    if (!obj) return null;
    return JSON.stringify(this.detach(obj));
  }

  async setItem(key: string, value: string): Promise<void> {
    const data = JSON.parse(value) as T;
    const realm = await this.getRealm();

    realm.write(() => {
      realm.create<T & Realm.Object>(
        this.objectType,
        // Always ensure the primary key property matches the provided key.
        { ...(data as any), [this.idKey]: key } as any,
        Realm.UpdateMode.Modified
      );
    });
  }

  async removeItem(key: string): Promise<void> {
    const realm = await this.getRealm();
    realm.write(() => {
      const obj = realm.objectForPrimaryKey<T & Realm.Object>(
        this.objectType,
        key
      );
      if (obj) {
        realm.delete(obj);
      }
    });
  }

  async clear(): Promise<void> {
    const realm = await this.getRealm();
    realm.write(() => {
      const all = realm.objects<T & Realm.Object>(this.objectType);
      realm.delete(all);
    });
  }

  async getAllKeys(): Promise<string[]> {
    const realm = await this.getRealm();
    const all = realm.objects<T & Realm.Object>(this.objectType);
    return all.map((obj: T & Realm.Object) => String((obj as any)[this.idKey]));
  }

  // ---- Typed helpers on top of the string-based API ----

  /**
   * Get a detached plain-object representation by id.
   */
  async getObject(id: string): Promise<T | null> {
    const realm = await this.getRealm();
    const obj = realm.objectForPrimaryKey<T & Realm.Object>(
      this.objectType,
      id
    );
    return obj ? this.detach(obj) : null;
  }

  /**
   * Upsert a single object into Realm.
   */
  async upsertObject(entity: T): Promise<void> {
    const realm = await this.getRealm();
    const id = (entity as any)[this.idKey];
    if (id == null) {
      throw new Error(
        `RealmRepository: entity is missing primary key "${this.idKey}".`
      );
    }

    realm.write(() => {
      realm.create<T & Realm.Object>(
        this.objectType,
        entity as any,
        Realm.UpdateMode.Modified
      );
    });
  }

  /**
   * Get all objects as plain JS values.
   */
  async getAllObjects(): Promise<T[]> {
    const realm = await this.getRealm();
    const all = realm.objects<T & Realm.Object>(this.objectType);
    return all.map((obj: T & Realm.Object) => this.detach(obj));
  }

  /**
   * Sync local Realm with data from the server.
   *
   * The caller controls how to fetch remote data and optionally
   * how to push local changes back.
   */
  async syncFromServer(handlers: SyncHandlers<T>): Promise<void> {
    const { fetchRemote, pushLocalChanges, merge } = handlers;
    const remoteItems = await fetchRemote();
    const realm = await this.getRealm();

    realm.write(() => {
      for (const remote of remoteItems) {
        const id = (remote as any)[this.idKey];
        if (id == null) {
          throw new Error(
            `RealmRepository.syncFromServer: remote item is missing primary key "${this.idKey}".`
          );
        }

        const existing = realm.objectForPrimaryKey<T & Realm.Object>(
          this.objectType,
          id
        );
        const existingDetached = existing ? this.detach(existing) : null;
        const next = merge ? merge(existingDetached, remote) : remote;

        realm.create<T & Realm.Object>(
          this.objectType,
          next as any,
          Realm.UpdateMode.Modified
        );
      }
    });

    if (pushLocalChanges) {
      const locals = await this.getAllObjects();
      await pushLocalChanges(locals);
    }
  }

  /**
   * Convert a live Realm object into a plain JS object so it can safely
   * be serialized, passed between threads, or used outside a write transaction.
   */
  private detach(obj: T & Realm.Object): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }
}
