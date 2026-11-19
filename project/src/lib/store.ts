import { useState, useCallback } from 'react';
import {
  Queue,
  PriorityQueue,
  Stack,
  HashMap,
  type QueuedPatient,
  type EmergencyPatient,
  type MedicineDispense,
  type PatientRecord,
} from './dataStructures';

// Singletons seeded with realistic demo data so the app feels alive on first load.

let idCounter = 1000;
export function nextId(prefix = 'P'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

// ---------- Patient Queue (FIFO) ----------
function seedQueue(): Queue<QueuedPatient> {
  const q = new Queue<QueuedPatient>();
  const seed: Omit<QueuedPatient, 'queuedAt'>[] = [
    { id: nextId('OPD'), name: 'Aarav Sharma', age: 34, gender: 'Male', department: 'General Medicine', arrivedAt: Date.now() - 5400000, status: 'waiting' },
    { id: nextId('OPD'), name: 'Priya Nair', age: 28, gender: 'Female', department: 'Dermatology', arrivedAt: Date.now() - 4200000, status: 'waiting' },
    { id: nextId('OPD'), name: 'Rahul Verma', age: 52, gender: 'Male', department: 'Orthopedics', arrivedAt: Date.now() - 2700000, status: 'waiting' },
    { id: nextId('OPD'), name: 'Sneha Iyer', age: 41, gender: 'Female', department: 'Cardiology', arrivedAt: Date.now() - 1500000, status: 'waiting' },
  ];
  seed.forEach((p) => q.enqueue({ ...p, queuedAt: p.arrivedAt }));
  return q;
}

// ---------- Emergency Triage (Priority Queue) ----------
function seedEmergency(): PriorityQueue<EmergencyPatient> {
  const pq = new PriorityQueue<EmergencyPatient>();
  const seed: Omit<EmergencyPatient, 'queuedAt'>[] = [
    { id: nextId('ER'), name: 'Vikram Rao', age: 67, gender: 'Male', department: 'ER', arrivedAt: Date.now() - 600000, priority: 1, complaint: 'Chest pain, suspected MI', vitals: { systolic: 86, diastolic: 54, pulse: 132, spo2: 90 } },
    { id: nextId('ER'), name: 'Meera Joshi', age: 5, gender: 'Female', department: 'ER', arrivedAt: Date.now() - 420000, priority: 2, complaint: 'High fever, convulsions', vitals: { systolic: 100, diastolic: 60, pulse: 128, spo2: 94 } },
    { id: nextId('ER'), name: 'Daniel Cole', age: 38, gender: 'Male', department: 'ER', arrivedAt: Date.now() - 300000, priority: 3, complaint: 'Fractured forearm', vitals: { systolic: 122, diastolic: 78, pulse: 96, spo2: 98 } },
    { id: nextId('ER'), name: 'Anita Desai', age: 29, gender: 'Female', department: 'ER', arrivedAt: Date.now() - 180000, priority: 4, complaint: 'Severe migraine', vitals: { systolic: 118, diastolic: 76, pulse: 88, spo2: 99 } },
    { id: nextId('ER'), name: 'Samuel Park', age: 22, gender: 'Male', department: 'ER', arrivedAt: Date.now() - 90000, priority: 5, complaint: 'Minor laceration', vitals: { systolic: 116, diastolic: 74, pulse: 80, spo2: 99 } },
  ];
  seed.forEach((p) => pq.enqueue({ ...p, queuedAt: p.arrivedAt }));
  return pq;
}

// ---------- Medicine Dispense (Stack) ----------
function seedStack(): Stack<MedicineDispense> {
  const s = new Stack<MedicineDispense>();
  const seed = [
    { patientName: 'Aarav Sharma', medicine: 'Amoxicillin 500mg', dosage: '1 cap × 3/day', dispensedBy: 'Pharmacist R. Khan' },
    { patientName: 'Priya Nair', medicine: 'Cetirizine 10mg', dosage: '1 tab at night', dispensedBy: 'Pharmacist R. Khan' },
    { patientName: 'Rahul Verma', medicine: 'Ibuprofen 400mg', dosage: '1 tab × 2/day', dispensedBy: 'Pharmacist L. Mwangi' },
  ];
  seed.forEach((d) => s.push({ id: nextId('RX'), dispensedAt: Date.now() - Math.random() * 3600000, ...d }));
  return s;
}

// ---------- Patient Records (Hash Map) ----------
function seedRecords(): HashMap<string, PatientRecord> {
  const m = new HashMap<string, PatientRecord>(16);
  const seed = [
    { name: 'Aarav Sharma', age: 34, gender: 'Male', bloodGroup: 'O+', phone: '+91 98200 11223', address: '12 MG Road, Pune', history: 'Hypertension, mild allergy to penicillin.' },
    { name: 'Priya Nair', age: 28, gender: 'Female', bloodGroup: 'A−', phone: '+91 98410 44556', address: '45 Marine Drive, Kochi', history: 'No chronic conditions. Eczema flare-ups.' },
    { name: 'Rahul Verma', age: 52, gender: 'Male', bloodGroup: 'B+', phone: '+91 99100 77889', address: '8 Civil Lines, Delhi', history: 'Type-2 diabetes, osteoarthritis of right knee.' },
    { name: 'Sneha Iyer', age: 41, gender: 'Female', bloodGroup: 'AB+', phone: '+91 99020 33445', address: '21 Anna Salai, Chennai', history: 'Atrial fibrillation, on beta-blockers.' },
    { name: 'Vikram Rao', age: 67, gender: 'Male', bloodGroup: 'O−', phone: '+91 98490 55667', address: '33 Banjara Hills, Hyderabad', history: 'Prior MI (2019), stent placement, COPD.' },
  ];
  seed.forEach((r) => {
    const id = nextId('REC');
    m.set(id, { id, ...r, createdAt: Date.now() - Math.random() * 86400000 * 30 });
  });
  return m;
}

export interface HospitalStore {
  opdQueue: Queue<QueuedPatient>;
  emergency: PriorityQueue<EmergencyPatient>;
  pharmacy: Stack<MedicineDispense>;
  records: HashMap<string, PatientRecord>;
}

export function createStore(): HospitalStore {
  return {
    opdQueue: seedQueue(),
    emergency: seedEmergency(),
    pharmacy: seedStack(),
    records: seedRecords(),
  };
}

// Hook that mirrors a data structure instance into React state via a version counter.
export function useStructure<T>(factory: () => T): [T, () => void] {
  const [ref] = useState(factory);
  const [, bump] = useState(0);
  const sync = useCallback(() => bump((n) => n + 1), []);
  return [ref, sync];
}
