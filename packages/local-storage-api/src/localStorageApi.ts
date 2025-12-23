


export abstract class LocalStorageApi {
    abstract getItem(key: string): Promise<string | null>;
    abstract setItem(key: string, value: string): Promise<void>;
    abstract removeItem(key: string): Promise<void>;
    abstract clear(): Promise<void>;
    abstract getAllKeys(): Promise<string[]>;
}