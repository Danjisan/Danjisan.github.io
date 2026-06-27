export class UnionFind {
  private parent = new Map<string, string>();

  constructor(keys: Iterable<string>) {
    for (const k of keys) this.parent.set(k, k);
  }

  find(k: string): string {
    let root = this.parent.get(k);
    if (!root) {
      this.parent.set(k, k);
      return k;
    }
    while (root !== this.parent.get(root)) {
      root = this.parent.get(root)!;
    }
    let cur = k;
    while (cur !== root) {
      const next = this.parent.get(cur)!;
      this.parent.set(cur, root);
      cur = next;
    }
    return root;
  }

  union(a: string, b: string): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(rb, ra);
  }

  roots(): string[] {
    const seen = new Set<string>();
    for (const k of this.parent.keys()) {
      seen.add(this.find(k));
    }
    return [...seen];
  }
}
