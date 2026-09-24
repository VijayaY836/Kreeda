import { SectionContent, HeritageCard } from '../types';
import { getImage } from './images';

export const SECTION_CONTENT: Record<'yoga' | 'vyayam' | 'dhyana', SectionContent> = {
  yoga: {
    section: 'yoga',
    title: 'Yoga',
    nativeName: 'యోగా',
    tagline: 'Flexibility, breath and balance — the body practice most of the world already knows by its Indian name.',
    color: 'var(--color-teal)',
    heroImage: getImage('surya-namaskar'),
    timeline: [
      { id: 'patanjali', era: 'c. 2nd century BCE – 4th century CE', title: 'Patanjali\'s Yoga Sutras', text: 'Systematised yoga into eight limbs, including asana (posture) and pranayama (breath) — dharana, dhyana and samadhi are the final three, carried further in Section C.', image: getImage('patanjali') },
      { id: 'hatha-pradipika', era: '15th century', title: 'Hatha Yoga Pradipika', text: 'A foundational Hatha Yoga text describing asanas, breath control and cleansing practices in detail.' },
      { id: 'gheranda-samhita', era: '17th–18th century', title: 'Gheranda Samhita', text: 'A later Hatha Yoga manual expanding the catalogue of postures and purification techniques.' },
      { id: 'vivekananda-chicago', era: '1893', title: 'Vivekananda in Chicago', text: 'Swami Vivekananda\'s address at the World\'s Parliament of Religions introduced yoga philosophy to a global audience.', image: getImage('vivekananda-chicago') },
      { id: 'international-yoga-day', era: '2015 –', title: 'International Day of Yoga', text: 'The UN-recognised International Day of Yoga (21 June) marks yoga\'s formal global reach.', image: getImage('international-yoga-day') },
    ],
    funFacts: [
      'Classical Hatha Yoga texts refer to a traditional set of 84 asanas, though far more have been catalogued since.',
      'The word "yoga" comes from the Sanskrit "yuj", meaning to yoke or unite.',
      'Surya Namaskar links 12 postures to one continuous cycle of breath — a moving meditation as much as a warm-up.',
    ],
    mapCaption: 'stitched line traces yoga\'s spread out of India',
    mapPath: true,
    pins: [
      { id: 'y-india', x: 44, y: 48, place: 'INDIA', name: 'Origin', fact: 'Yoga\'s philosophical and physical roots stretch back over two millennia, systematised by Patanjali and later Hatha Yoga texts.', how: 'Origin — asana and pranayama practice developed across centuries of Indian tradition.', image: getImage('patanjali') },
      { id: 'y-usa', x: 22, y: 30, place: 'UNITED STATES', name: '1893 Parliament of Religions', fact: 'Vivekananda\'s Chicago address introduced yoga philosophy to the West for the first time on a major public stage.', how: 'Carried by traveling teachers and later the 20th-century wellness movement.', image: getImage('vivekananda-chicago') },
      { id: 'y-global', x: 60, y: 20, place: 'WORLDWIDE', name: 'International Day of Yoga', fact: 'Since 2015, 21 June is observed globally as International Day of Yoga, following a UN resolution.', how: 'Formal international recognition following decades of global practice.', image: getImage('international-yoga-day') },
    ],
    sources: [
      { title: 'Ministry of External Affairs — Yoga Postures', ref: 'mea.gov.in/yoga-postures-17' },
      { title: 'Common Yoga Protocol, Ministry of Ayush', ref: 'mea.gov.in/images/pdf/common-yoga-protocol-english.pdf' },
    ],
  },

  vyayam: {
    section: 'vyayam',
    title: 'Vyayam',
    nativeName: 'వ్యాయామం',
    tagline: 'Desi strength training from the akhada — Dand and Baithak, built on the ardhashakti principle.',
    color: 'var(--color-terracotta)',
    heroImage: getImage('akhada'),
    timeline: [
      { id: 'sushruta-samhita', era: 'Ancient', title: 'Sushruta Samhita', text: 'One of the foundational texts of Ayurveda describes ardhashakti — exercising to about half of one\'s full capacity — as the traditional guide to safe exertion.' },
      { id: 'manasollasa', era: '12th century', title: 'Manasollasa', text: 'A royal encyclopaedia of the Chalukya court describing physical training and wrestling practices of the era.' },
      { id: 'malla-purana', era: 'Medieval', title: 'Malla Purana', text: 'A text specifically dedicated to the training methods and code of the wrestling (malla) tradition.' },
      { id: 'akhada-great-gama', era: '19th–20th century', title: 'Akhada Culture & the Great Gama', text: 'Akhadas (wrestling gymnasiums) refined Dand-Baithak training; the legendary wrestler the Great Gama was said to perform thousands of reps daily.', image: getImage('great-gama') },
      { id: 'surya-namaskar-akhada', era: 'Early 20th century', title: 'Surya Namaskar in the Akhada', text: 'The Raja of Aundh popularised Surya Namaskar as a conditioning tool used alongside Dand-Baithak in akhadas.', image: getImage('surya-namaskar') },
    ],
    funFacts: [
      'Ardhashakti — training at about half capacity — is the traditional principle this app\'s intensity engine is built around.',
      'The Great Gama reportedly performed thousands of Dand and Baithak repetitions as part of his daily akhada training.',
      'Indian clubs, swung in pairs like small maces, grew out of mudgar and jori practice.',
    ],
    mapCaption: 'stitched line traces Indian clubs\' journey to Britain',
    mapPath: true,
    pins: [
      { id: 'v-india', x: 44, y: 48, place: 'INDIA', name: 'Akhada Origin', fact: 'Dand, Baithak and mudgar/jori swinging developed inside the akhada wrestling tradition over centuries.', how: 'Origin — akhada strength training passed down through wrestling lineages.', image: getImage('akhada') },
      { id: 'v-uk', x: 50, y: 22, place: 'UNITED KINGDOM', name: 'Indian Clubs', fact: 'Indian clubs, based on the mudgar and jori, became a Victorian-era fitness craze across Britain.', how: 'Carried back by British officers and enthusiasts who trained with Indian wrestlers.', image: getImage('indian-clubs') },
      { id: 'v-us', x: 22, y: 26, place: 'UNITED STATES', name: 'Club-Swinging Fitness', fact: 'Indian-club swinging spread further into American gymnasiums and physical-culture programmes in the early 20th century.', how: 'Spread through the same physical-culture movement that popularised Indian clubs in the West.', image: getImage('indian-clubs') },
    ],
    sources: [
      { title: 'Sushruta Samhita — ardhashakti principle', ref: 'TBD — verify page reference before release' },
      { title: 'Manasollasa (12th c.) — Chalukya court text', ref: 'TBD — verify against academic source' },
      { title: 'Malla Purana — wrestling training text', ref: 'TBD — verify against academic source' },
    ],
  },

  dhyana: {
    section: 'dhyana',
    title: 'Dhyana',
    nativeName: 'ధ్యానం',
    tagline: 'Meditation across India\'s traditions — Buddhist, Vedic, Jain and Yogic — for a quieter mind.',
    color: 'var(--color-blue)',
    heroImage: getImage('dhyana-mudra'),
    timeline: [
      { id: 'patanjali-dhyana', era: 'c. 2nd century BCE – 4th century CE', title: 'Patanjali\'s Yoga Sutras', text: 'Names dharana (concentration), dhyana (meditation) and samadhi (absorption) as the final three limbs of yoga, following directly from Section A\'s asana and pranayama.', image: getImage('patanjali') },
      { id: 'beatles-rishikesh', era: '1968', title: 'The Beatles in Rishikesh', text: 'The Beatles\' stay at Maharishi Mahesh Yogi\'s ashram brought global pop-culture attention to Indian meditation.', image: getImage('rishikesh-beatles-ashram') },
      { id: 'goenka-vipassana', era: '20th century –', title: 'S.N. Goenka\'s Vipassana Centres', text: 'Goenka helped re-establish and globally spread 10-day Vipassana courses rooted in the Anapana technique.', image: getImage('vipassana') },
      { id: 'preksha-systematised', era: '20th century', title: 'Preksha Dhyana Systematised', text: 'Acharya Mahapragya organised the Jain tradition\'s perception-based meditation into the structured practice of Preksha Dhyana.', image: getImage('preksha-dhyana') },
    ],
    funFacts: [
      'Dhyana travelled east and changed its name at every stop: Dhyana → Chan (China) → Seon (Korea) → Zen (Japan) → Thiền (Vietnam).',
      'The word "meditation" in English maps to very different practices across traditions — this module alone draws from four.',
      'A full Vipassana course is traditionally ten days of silence — this app\'s Anapana sessions are a short daily introduction, not a substitute.',
    ],
    mapCaption: 'Dhyana → Chan → Seon → Zen → Thiền',
    mapPath: true,
    pins: [
      { id: 'd-india', x: 44, y: 48, place: 'INDIA', name: 'Dhyana', fact: 'Meditation traditions across Buddhist, Vedic, Jain and Yogic schools all developed on the subcontinent.', how: 'Origin of the term and practice of dhyana.', image: getImage('anapana') },
      { id: 'd-china', x: 62, y: 38, place: 'CHINA', name: 'Chan', fact: 'Buddhist meditation entered China and became Chan Buddhism.', how: 'Carried along Silk Road Buddhist transmission routes.', image: getImage('dhyana-mudra') },
      { id: 'd-korea', x: 70, y: 32, place: 'KOREA', name: 'Seon', fact: 'Chan practice reached Korea and developed into the Seon tradition.', how: 'Transmitted through Buddhist monastic exchange with China.', image: getImage('dhyana-mudra') },
      { id: 'd-japan', x: 78, y: 30, place: 'JAPAN', name: 'Zen', fact: 'The same lineage reached Japan and became Zen — now one of the most globally recognised words for meditation.', how: 'Transmitted through Chinese Chan Buddhist teachers.', image: getImage('zen-meditation') },
      { id: 'd-vietnam', x: 66, y: 52, place: 'VIETNAM', name: 'Thiền', fact: 'A parallel branch of the same Chan lineage took root in Vietnam as Thiền Buddhism.', how: 'Transmitted directly from Chinese Chan Buddhism.' },
    ],
    sources: [
      { title: 'Patanjali\'s Yoga Sutras — dharana, dhyana, samadhi', ref: 'TBD — verify translation source' },
      { title: 'S.N. Goenka Vipassana tradition', ref: 'TBD — verify against published source' },
      { title: 'Preksha Dhyana, Acharya Mahapragya', ref: 'TBD — verify against published source' },
    ],
  },
};

const HERITAGE_BASE: Omit<HeritageCard, 'image'>[] = [
  { id: 'mudgar', name: 'Mudgar', name_english: 'Club / Mace', blurb: 'A wooden club swung in flowing patterns to build shoulder and grip strength — the ancestor of the Indian club.', why_not_in_plan: 'Requires equipment and correct swinging technique to use safely.' },
  { id: 'gada', name: 'Gada', name_english: 'Mace', blurb: 'A heavier stone or metal mace used for advanced strength training, associated with wrestlers and the deity Hanuman.', why_not_in_plan: 'Requires specialised equipment and supervised technique.' },
  { id: 'jori', name: 'Jori', name_english: 'Paired Clubs', blurb: 'A pair of wooden clubs swung together in coordinated patterns for shoulder mobility and stamina.', why_not_in_plan: 'Requires equipment and coached form to avoid injury.' },
  { id: 'nal', name: 'Nal', name_english: 'Stone Ring', blurb: 'A heavy perforated stone ring lifted and pressed for grip and full-body strength.', why_not_in_plan: 'Requires specialised heavy equipment.' },
  { id: 'kushti', name: 'Kushti', name_english: 'Traditional Wrestling', blurb: 'The wrestling discipline practised in akhadas, combining conditioning, technique and a strict lifestyle code.', why_not_in_plan: 'A supervised combat sport, not something to self-teach from an app.' },
  { id: 'mallakhamb', name: 'Mallakhamb', name_english: 'Pole Gymnastics', blurb: 'Gymnastic and wrestling exercises performed on a fixed or hanging wooden pole or rope.', why_not_in_plan: 'High injury risk without a trained coach and equipment.' },
  { id: 'kalaripayattu', name: 'Kalaripayattu', name_english: 'Martial Art of Kerala', blurb: 'One of the oldest martial arts in the world, combining strikes, weapons training and healing traditions.', why_not_in_plan: 'A martial art requiring in-person instruction, not self-taught exercise.' },
];

export const HERITAGE_CARDS: HeritageCard[] = HERITAGE_BASE.map(c => ({ ...c, image: getImage(c.id) }));
