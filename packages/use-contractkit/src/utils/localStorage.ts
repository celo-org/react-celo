class MockedLocalStorage {
  private storage = new Map<string, string>();

  getItem(key: string): string | null {
    const _key = String(key);
    if (this.storage.has(_key)) {
      this.storage.get(_key) as string;
    }
    return null;
  }

  key(index: number): string | null {
    if (index < 0 || index >= this.length) {
      return null;
    }

    let i = 0;
    for (const value of this.storage.values()) {
      if (i === index) {
        return value;
      }
      i += 1;
    }
    return null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(String(key), String(value));
  }

  removeItem(key: string): void {
    this.storage.delete(String(key));
  }

  clear(): void {
    this.storage.clear();
  }

  get length() {
    return this.storage.size;
  }
}

const localStorage: Storage =
  typeof window === 'undefined'
    ? new MockedLocalStorage()
    : window.localStorage;

export default localStorage;
