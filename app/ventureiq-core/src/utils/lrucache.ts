
interface DLLNode<K, V> {
  key: K;
  value: V;
  prev: DLLNode<K, V> | null;
  next: DLLNode<K, V> | null;
}

export class LRUCache<K, V> {
  private readonly capacity: number;
  private readonly map: Map<K, DLLNode<K, V>>;

  // Most recently used node
  private head: DLLNode<K, V> | null;

  // Least recently used node
  private tail: DLLNode<K, V> | null;

  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error("LRU cache capacity must be a positive integer");
    }

    this.capacity = capacity;
    this.map = new Map();
    this.head = null;
    this.tail = null;
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);

    if (!node) {
      return undefined;
    }

    // Mark the accessed node as most recently used.
    this.moveToFront(node);

    return node.value;
  }

  put(key: K, value: V): void {
    const existingNode = this.map.get(key);

    if (existingNode) {
      existingNode.value = value;
      this.moveToFront(existingNode);
      return;
    }

    const newNode: DLLNode<K, V> = {
      key,
      value,
      prev: null,
      next: null,
    };

    this.map.set(key, newNode);
    this.addToFront(newNode);

    if (this.map.size > this.capacity) {
      this.evictLRU();
    }
  }

  delete(key: K): void {
    const node = this.map.get(key);

    if (!node) {
      return;
    }

    this.removeNode(node);
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
    this.head = null;
    this.tail = null;
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  get size(): number {
    return this.map.size;
  }

  get maxCapacity(): number {
    return this.capacity;
  }

  private addToFront(node: DLLNode<K, V>): void {
    node.prev = null;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: DLLNode<K, V>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    node.prev = null;
    node.next = null;
  }

  private moveToFront(node: DLLNode<K, V>): void {
    if (this.head === node) {
      return;
    }

    this.removeNode(node);
    this.addToFront(node);
  }

  private evictLRU(): void {
    if (!this.tail) {
      return;
    }

    const lruKey = this.tail.key;

    this.removeNode(this.tail);
    this.map.delete(lruKey);
  }
}