// Core data structure implementations used throughout the hospital system.
// These are framework-agnostic so they can be visualized in any UI.

export type PatientPriority = 1 | 2 | 3 | 4 | 5;
// 1 = critical, 5 = non-urgent (lower number = higher priority)

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  department: string;
  arrivedAt: number;
}

export interface QueuedPatient extends Patient {
  status: 'waiting' | 'serving' | 'served';
  queuedAt: number;
}

export interface EmergencyPatient extends Patient {
  priority: PatientPriority;
  complaint: string;
  vitals?: { systolic?: number; diastolic?: number; pulse?: number; spo2?: number };
  queuedAt: number;
}

export interface MedicineDispense {
  id: string;
  patientName: string;
  medicine: string;
  dosage: string;
  dispensedAt: number;
  dispensedBy: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  address: string;
  history: string;
  createdAt: number;
}

// ---------- Queue (FIFO) ----------
export class Queue<T> {
  private items: T[] = [];

  enqueue(item: T): number {
    this.items.push(item);
    return this.size();
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  peek(): T | undefined {
    return this.items[0];
  }

  size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  toArray(): T[] {
    return [...this.items];
  }

  remove(id: string): T | undefined {
    const idx = this.items.findIndex((p: T) => (p as { id?: string }).id === id);
    if (idx === -1) return undefined;
    const [removed] = this.items.splice(idx, 1);
    return removed;
  }
}

// ---------- Priority Queue (Min-Heap) ----------
export class PriorityQueue<T extends { priority: number }> {
  private heap: T[] = [];

  enqueue(item: T): number {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
    return this.heap.length;
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  toArray(): T[] {
    return [...this.heap].sort((a, b) => a.priority - b.priority);
  }

  remove(id: string): T | undefined {
    const idx = this.heap.findIndex((p: T) => (p as { id?: string }).id === id);
    if (idx === -1) return undefined;
    const removed = this.heap[idx];
    const last = this.heap.pop()!;
    if (idx < this.heap.length) {
      this.heap[idx] = last;
      this.bubbleUp(idx);
      this.sinkDown(idx);
    }
    return removed;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[parent].priority <= this.heap[index].priority) break;
      [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
      index = parent;
    }
  }

  private sinkDown(index: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      if (left < n && this.heap[left].priority < this.heap[smallest].priority) smallest = left;
      if (right < n && this.heap[right].priority < this.heap[smallest].priority) smallest = right;
      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

// ---------- Stack (LIFO) ----------
export class Stack<T> {
  private items: T[] = [];

  push(item: T): number {
    this.items.push(item);
    return this.size();
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  toArray(): T[] {
    return [...this.items];
  }
}

// ---------- Hash Map ----------
export class HashMap<K, V> {
  private buckets: [K, V][][] = [];
  private count = 0;
  private readonly capacity: number;

  constructor(capacity = 16) {
    this.capacity = capacity;
    this.buckets = Array.from({ length: capacity }, () => []);
  }

  private hash(key: K): number {
    const str = String(key);
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h) % this.capacity;
  }

  set(key: K, value: V): void {
    const idx = this.hash(key);
    const bucket = this.buckets[idx];
    const existing = bucket.find(([k]) => k === key);
    if (existing) {
      existing[1] = value;
    } else {
      bucket.push([key, value]);
      this.count++;
    }
  }

  get(key: K): V | undefined {
    const bucket = this.buckets[this.hash(key)];
    return bucket.find(([k]) => k === key)?.[1];
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    const idx = this.hash(key);
    const bucket = this.buckets[idx];
    const i = bucket.findIndex(([k]) => k === key);
    if (i === -1) return false;
    bucket.splice(i, 1);
    this.count--;
    return true;
  }

  size(): number {
    return this.count;
  }

  values(): V[] {
    return this.buckets.flatMap((b) => b.map(([, v]) => v));
  }

  entries(): [K, V][] {
    return this.buckets.flatMap((b) => b);
  }

  bucketDistribution(): { index: number; size: number }[] {
    return this.buckets.map((b, i) => ({ index: i, size: b.length }));
  }
}
