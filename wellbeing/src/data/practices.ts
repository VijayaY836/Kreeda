import { Practice, Section } from '../types';
import { YOGA_PRACTICES } from './yogaPractices';
import { VYAYAM_PRACTICES } from './vyayamPractices';
import { DHYANA_PRACTICES } from './dhyanaPractices';

export const ALL_PRACTICES: Practice[] = [...YOGA_PRACTICES, ...VYAYAM_PRACTICES, ...DHYANA_PRACTICES];

const BY_ID: Record<string, Practice> = Object.fromEntries(ALL_PRACTICES.map(p => [p.id, p]));

export function getPractice(id: string): Practice | undefined {
  return BY_ID[id];
}

export function practicesBySection(section: Section): Practice[] {
  return ALL_PRACTICES.filter(p => p.section === section);
}

export const LIBRARY_GROUPS: Record<Section, { key: string; label: string }[]> = {
  yoga: [
    { key: 'loosening', label: 'Loosening' },
    { key: 'surya_namaskar', label: 'Surya Namaskar' },
    { key: 'asana', label: 'Asanas' },
    { key: 'pranayama', label: 'Pranayama' },
  ],
  vyayam: [
    { key: 'dand', label: 'Dand' },
    { key: 'baithak', label: 'Baithak' },
    { key: 'sapate', label: 'Sapate' },
    { key: 'mobility', label: 'Mobility' },
  ],
  dhyana: [
    { key: 'meditation', label: 'Meditation Practices' },
  ],
};
