class MockedLocalStorage implements Storage {
  private storage = new Map<string, string>();

  getItem(key: string): string | null {
    if (this.storage.has(key)) {
      this.storage.get(key) as string;
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
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  get length(): number {
    return this.storage.size;
  }
}

const localStorage =
  typeof window === 'undefined'
    ? new MockedLocalStorage()
    : window.localStorage;

export default localStorage;
