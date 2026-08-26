import type { SquareName, ViceName, VirtueName } from './vp'

export type Lang = 'te' | 'en' | 'hi' | 'ta' | 'ml'
export const LANGS: Lang[] = ['te', 'en', 'hi', 'ta', 'ml']

export interface VPMsg {
  startVs: string
  startSolo: string
  move: string
  over: string
  ladder: string
  snake: string
  six: string
  sixes: string
  toastL: string
  toastS: string
  win: string
}

export interface VPStrings {
  label: string
  name: string
  digits: string
  you: string
  roll: string
  janma: { w: string; t: string }
  moksha: { w: string; t: string }
  virt: Record<VirtueName, string>
  vice: Record<ViceName, string>
  mean: Record<SquareName, string>
  msg: VPMsg
  bubble: { pre: string[]; snake: string[]; ladder: string[] }
  win: {
    placeYou: string
    placeK: string
    titleYou: string
    titleK: string
    statsSolo: string
    statsVsYou: string
    statsVsK: string
    newBest: string
    best: string
    noteY: string
    noteK: string
    again: string
    back: string
  }
  guide: {
    kicker: string
    title: string
    aboutT: string
    about: string
    ladT: string
    vicT: string
    th0: string
    th1: string
    th2: string
    rulesT: string
    rules: string[]
  }
}

export function fmt(s: string, o: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(o[k] ?? ''))
}

export const VP_I18N: Record<Lang, VPStrings> = {
  te: {
    label: 'తెలుగు', name: 'వైకుంఠపాళి', digits: '౦౧౨౩౪౫౬౭౮౯',
    you: 'నేను', roll: 'పాస వెయ్యి',
    janma: { w: 'జన్మ', t: 'Janma' }, moksha: { w: 'వైకుంఠం', t: 'Vaikuntham' },
    virt: { Vinaya: 'వినయ', Dāna: 'దానం', Seva: 'సేవ', Śraddha: 'శ్రద్ధ', Jñāna: 'జ్ఞానం', Dhyāna: 'ధ్యానం', Dayā: 'దయ' },
    vice: { Krodha: 'క్రోధం', Matsarya: 'అసూయ', Lobha: 'లోభం', Moha: 'మోహం', Mada: 'మదం', Ahaṅkāra: 'అహంకారం', Kāma: 'కామం' },
    mean: { Vinaya: 'వినమ్రత', Dāna: 'దానశీలం', Seva: 'సేవ', Śraddha: 'విశ్వాసం', Jñāna: 'జ్ఞానం', Dhyāna: 'ధ్యానం', Dayā: 'జాలి', Krodha: 'కోపం', Matsarya: 'అసూయ', Lobha: 'దురాశ', Moha: 'మోహం', Mada: 'గర్వం', Ahaṅkāra: 'అహంకారం', Kāma: 'కామం' },
    msg: {
      startVs: 'ప్రయాణం జన్మ (గడి 1) నుండి — వైకుంఠానికి క్రీడూతో పరుగు!',
      startSolo: 'ప్రయాణం జన్మ (గడి 1) నుండి — గడియారం మొదలైంది!',
      move: '{e}: {v} → గడి {p}',
      over: '{e}: {v} — {goal}కి ఖచ్చితంగా {n} కావాలి, {p} వద్ద ఆగింది',
      ladder: '{e}: {name} ఎత్తు — {a} ↑ {b}',
      snake: '{e}: {name} పాము — {a} ↓ {b}',
      six: 'ఆరు! {e} ఇంకోసారి వెయ్యాలి.',
      sixes: '{e}: వరుసగా మూడు ఆరులు — దురాశకి శిక్ష, టర్న్ పోయింది!',
      toastL: '{name}! {a} → {b}',
      toastS: '{name} కుట్టింది! {a} → {b}',
      win: '{e} వైకుంఠం చేరుకుంది — మోక్షం!',
    },
    bubble: {
      pre: ['క్రీడూ పాస విసిరింది…', 'నా టర్న్!', 'జాగ్రత్తగా చూడండి.', 'నేను వెడ్తాను!'],
      snake: ['ఆహా — పాము కుట్టింది!', 'వెనక్కి పోతున్నా…', 'ఈరోజు వైసులు రౌద్రంగా ఉన్నాయి!'],
      ladder: ['పైకి ఎగురుతున్నా!', 'సద్గుణం ఫలిస్తుంది!', 'పైన కలుద్దాం!'],
    },
    win: {
      placeYou: 'వైకుంఠం చేరుకున్నారు', placeK: 'క్రీడూ వైకుంఠం చేరుకుంది',
      titleYou: 'మోక్షం ప్రాప్తించింది!', titleK: 'క్రీడూ ముందు చేరింది!',
      statsSolo: 'సమయం {time} · పాసలు {r}',
      statsVsYou: 'పాసలు {r} · క్రీడూ గడి {p} వద్ద',
      statsVsK: 'పాసలు {r} · మీరు గడి {p} వద్ద',
      newBest: 'కొత్త రికార్డు!', best: 'అత్యుత్తమం: {time}',
      noteY: 'ప్రతి సద్గుణం పనిచేసింది.',
      noteK: 'అసద్గుణాలు ఘాటుగా కుట్టాయి — ప్రతి జన్మ కొత్త అవకాశం. మళ్ళీ ప్రయత్నించండి.',
      again: 'మళ్ళీ ఆడు', back: 'గేమ్ సమాచారానికి',
    },
    guide: {
      kicker: 'పటం మార్గదర్శకం · వైకుంఠపాళి',
      title: 'సద్గుణ-అసద్గుణాల పటము',
      aboutT: 'ఈ పటం గురించి',
      about: 'వైకుంఠపాళి <strong>మోక్ష పటం</strong> ("మోక్షానికి ఎత్తు") నుంచి, 19వ శతాబ్దపు జైన <strong>జ్ఞాన చౌపర్</strong> బజారు చిత్రాల నుంచి వచ్చింది. ఇది పరుగు పటం కాదు — నీతి పటం: ప్రతి గడి జీవిత ఘట్టం; సద్గుణాలు ఎత్తులుగా మోక్షం వైపు లాగుతాయి, అసద్గుణాలు (పాములు) వెనక్కి ఈడ్చుతాయి. గడి 1 <strong>జన్మ</strong>; గడి 100 <strong>వైకుంఠం</strong>.',
      ladT: 'ఏడు ఎత్తులు — సద్గుణాలు',
      vicT: 'ఏడు పాములు — అసద్గుణాలు',
      th0: 'గడి', th1: 'పేరు', th2: 'అర్థం',
      rulesT: 'ఇక్కడ ఆడే నియమాలు',
      rules: [
        'పాస విసిరి ముందుకు సాగండి. <strong>6 వస్తే మరో వేసవి</strong> — కానీ వరుసగా మూడు 6లు టర్న్ ఖరాయి.',
        '<strong>సద్గుణం</strong> పడితే ఎత్తు ఎక్కుతుంది; <strong>అసద్గుణం</strong> పడితే పాము దింపుతుంది.',
        '100 మీద <strong>ఖచ్చితంగా</strong> నిలవాలి — ఎక్కువ వస్తే అక్కడే వేచి ఉండాలి.',
        'ఇద్దరూ ఒకే గడిలో ఉండవచ్చు — ఇది యుద్ధం కాదు, తీర్థయాత్ర.',
        '<strong>సోలో</strong> మోడ్‌లో గడియారంతో పరుగు; క్రీడూతో నేరుగా పోటీ.',
      ],
    },
  },
  en: {
    label: 'English', name: 'Snakes and Ladders', digits: '0123456789',
    you: 'You', roll: 'Roll the die',
    janma: { w: 'Birth', t: 'Janma' }, moksha: { w: 'Vaikuntham', t: 'Moksha' },
    virt: { Vinaya: 'Humility', Dāna: 'Charity', Seva: 'Service', Śraddha: 'Faith', Jñāna: 'Knowledge', Dhyāna: 'Meditation', Dayā: 'Compassion' },
    vice: { Krodha: 'Anger', Matsarya: 'Envy', Lobha: 'Greed', Moha: 'Delusion', Mada: 'Pride', Ahaṅkāra: 'Ego', Kāma: 'Desire' },
    mean: { Vinaya: 'Humility', Dāna: 'Charity', Seva: 'Service', Śraddha: 'Faith', Jñāna: 'Knowledge', Dhyāna: 'Meditation', Dayā: 'Compassion', Krodha: 'Anger', Matsarya: 'Envy', Lobha: 'Greed', Moha: 'Delusion', Mada: 'Pride', Ahaṅkāra: 'Ego', Kāma: 'Desire' },
    msg: {
      startVs: 'The race is on — from Janma, square 1, to Vaikuntham against Kreedu!',
      startSolo: 'The clock is running — the journey begins at Janma, square 1.',
      move: '{e} rolled {v} → square {p}',
      over: '{e} rolled {v} — needs exactly {n} for {goal}; staying at {p}',
      ladder: '{name} lifts {e}: {a} ↑ {b}',
      snake: '{name} bites {e}: {a} ↓ {b}',
      six: 'Six! {e} rolls again.',
      sixes: '{e} rolled three sixes — greed punished, turn forfeited!',
      toastL: '{name}! {a} → {b}',
      toastS: '{name} bites! {a} → {b}',
      win: '{e} reaches Vaikuntham — moksha attained!',
    },
    bubble: {
      pre: ['Kreedu shakes the die…', 'My turn!', 'Watch closely now.', 'Here I go!'],
      snake: ['Oh no — that snake got me!', 'Backwards I go…', 'The vices are cruel today!'],
      ladder: ['Up I climb!', 'Virtue pays off!', 'See you at the top!'],
    },
    win: {
      placeYou: 'VAIKUNTHAM REACHED', placeK: 'KREEDU REACHES VAIKUNTHAM',
      titleYou: 'Moksha attained!', titleK: 'Kreedu got there first!',
      statsSolo: 'Time {time} · Rolls {r}',
      statsVsYou: 'Rolls {r} · Kreedu finished at square {p}',
      statsVsK: 'Rolls {r} · You reached square {p}',
      newBest: 'New personal best!', best: 'Personal best: {time}',
      noteY: 'Every virtue held. The vices never stood a chance.',
      noteK: 'The vices bite hard — but every Janma is a new chance. Try again.',
      again: 'Play again', back: 'Back to game info',
    },
    guide: {
      kicker: 'BOARD GUIDE · VAIKUNTHAPALI',
      title: 'The map of virtue and vice',
      aboutT: 'About this board',
      about: 'Vaikunthapali descends from <strong>Moksha Patam</strong> ("the ladder to salvation") and the Jain <strong>Gyan Chauper</strong> ("game of knowledge") painted by 19th-century bazaar artists. The board is not a race track but a moral map: every square is a stage of life, ladders are virtues that lift you toward liberation, and snakes are the inner enemies that pull you back. Square 1 is <strong>Janma</strong> (birth); square 100 is <strong>Vaikuntham</strong>, Vishnu\u2019s abode.',
      ladT: 'The seven ladders — virtues',
      vicT: 'The seven snakes — vices',
      th0: 'From → To', th1: 'Name', th2: 'Meaning',
      rulesT: 'Rules played here',
      rules: [
        'Roll the die and advance. A <strong>6 grants one extra roll</strong> — but three 6s in a row forfeit the turn.',
        'Landing on a <strong>virtue</strong> climbs its ladder; landing on a <strong>vice</strong> slides down its snake.',
        'You must land on 100 <strong>exactly</strong>. Overshoot and you wait for another roll.',
        'Travellers may share a square — this is a pilgrimage, not a battle.',
        '<strong>Solo mode</strong> races the clock; against Kreedu it is a straight race to moksha.',
      ],
    },
  },
  hi: {
    label: 'हिंदी', name: 'ज्ञान चौपड़', digits: '०१२३४५६७८९',
    you: 'आप', roll: 'पासा फेंकिए',
    janma: { w: 'जन्म', t: 'Janma' }, moksha: { w: 'वैकुंठ', t: 'Vaikuntham' },
    virt: { Vinaya: 'विनय', Dāna: 'दान', Seva: 'सेवा', Śraddha: 'श्रद्धा', Jñāna: 'ज्ञान', Dhyāna: 'ध्यान', Dayā: 'दया' },
    vice: { Krodha: 'क्रोध', Matsarya: 'ईर्ष्या', Lobha: 'लोभ', Moha: 'मोह', Mada: 'मद', Ahaṅkāra: 'अहंकार', Kāma: 'काम' },
    mean: { Vinaya: 'विनम्रता', Dāna: 'दानशीलता', Seva: 'सेवा', Śraddha: 'विश्वासं', Jñāna: 'ज्ञान', Dhyāna: 'ध्यान', Dayā: 'दया', Krodha: 'क्रोध', Matsarya: 'ईर्ष्या', Lobha: 'लोभ', Moha: 'मोह', Mada: 'अहंकार-मद', Ahaṅkāra: 'अहंकार', Kāma: 'काम' },
    msg: {
      startVs: 'जन्म, खाना 1 से यात्रा — क्रीड़ू के साथ वैकुंठ की होड़!',
      startSolo: 'घड़ी चल रही है — जन्म, खाना 1 से यात्रा!',
      move: '{e}: {v} → खाना {p}',
      over: '{e}: {v} — {goal} के लिए ठीक {n} चाहिए, {p} पर रुके',
      ladder: '{e}: {name} — {a} ↑ {b}',
      snake: '{e}: {name} — {a} ↓ {b}',
      six: 'छह! {e} फिर फेंके.',
      sixes: '{e}: लगातार तीन छह — लोभ की सज़ा, चाल ज़ब्त!',
      toastL: '{name}! {a} → {b}',
      toastS: '{name} ने डसा! {a} → {b}',
      win: '{e} वैकुंठ पहुँचा — मोक्ष!',
    },
    bubble: {
      pre: ['क्रीड़ू पासा हिला रहा है…', 'मेरी बारी!', 'ध्यान से देखिए.', 'ले, फेंकता हूँ!'],
      snake: ['अरे! साँप ने डस लिया!', 'पीछे जा रहा हूँ…', 'आज दोष बड़े क्रूर हैं!'],
      ladder: ['ऊपर चढ़ रहा हूँ!', 'पुण्य का फल!', 'शिखर पर मिलते हैं!'],
    },
    win: {
      placeYou: 'वैकुंठ पहुँच गए', placeK: 'क्रीड़ू वैकुंठ पहुँचा',
      titleYou: 'मोक्ष प्राप्त!', titleK: 'क्रीड़ू पहले पहुँचा!',
      statsSolo: 'समय {time} · फेंक {r}',
      statsVsYou: 'फेंक {r} · क्रीड़ू खाना {p} पर',
      statsVsK: 'फेंक {r} · आप खाना {p} पर',
      newBest: 'नया रिकॉर्ड!', best: 'सर्वश्रेष्ठ: {time}',
      noteY: 'हर पुण्य काम आया — दोष दूर रहे.',
      noteK: 'दोषों ने कड़ा डसा — हर जन्म नया मौका. फिर कोशिश करें.',
      again: 'फिर खेलें', back: 'पीछे',
    },
    guide: {
      kicker: 'बोर्ड गाइड · ज्ञान चौपड़',
      title: 'पुण्य-पाप का नक्शा',
      aboutT: 'इस बोर्ड के बारे में',
      about: 'यह खेल <strong>मोक्ष पट</strong> ("मोक्ष की सीढ़ी") और 19वीं सदी के जैन <strong>ज्ञान चौपड़</strong> बाज़ार-चित्रों से आता है। यह दौड़ का मैदान नहीं, नीति का नक्शा है: हर खाना जीवन का चरण; पुण्य सीढ़ियाँ हैं जो मोक्ष की ओर उठाते हैं, और साँप भीतरी शत्रु हैं जो खींचते हैं। खाना 1 <strong>जन्म</strong>; खाना 100 <strong>वैकुंठ</strong>.',
      ladT: 'सात सीढ़ियाँ — पुण्य',
      vicT: 'सात साँप — दोष',
      th0: 'खाना', th1: 'नाम', th2: 'अर्थ',
      rulesT: 'यहाँ के नियम',
      rules: [
        'पासा फेंकिए और आगे बढ़ें। <strong>6 पर एक और फेंक</strong> — पर लगातार तीन 6 चाल ज़ब्त।',
        '<strong>पुण्य</strong> पर सीढ़ी चढ़ती है; <strong>दोष</strong> पर साँप उतारता है।',
        '100 पर <strong>ठीक</strong> उतरना ज़रूरी — अधिक आया तो वहीं इंतज़ार।',
        'दोनों एक ही खाने में रह सकते हैं — युद्ध नहीं, तीर्थयात्रा।',
        '<strong>सोलो</strong> में घड़ी से दौड़; क्रीड़ू के साथ सीधी होड़.',
      ],
    },
  },
  ta: {
    label: 'தமிழ்', name: 'பரமபடம்', digits: '0123456789',
    you: 'நான்', roll: 'டை உருட்டு',
    janma: { w: 'பிறப்பு', t: 'Pirappu' }, moksha: { w: 'பரமபதம்', t: 'Parama Padam' },
    virt: { Vinaya: 'அடக்கம்', Dāna: 'ஈகை', Seva: 'தொண்டு', Śraddha: 'நம்பிக்கை', Jñāna: 'அறிவு', Dhyāna: 'தியானம்', Dayā: 'கருணை' },
    vice: { Krodha: 'கோபம்', Matsarya: 'பொறாமை', Lobha: 'பேராசை', Moha: 'மோகம்', Mada: 'கர்வம்', Ahaṅkāra: 'அகங்காரம்', Kāma: 'காமம்' },
    mean: { Vinaya: 'அடக்கம்', Dāna: 'ஈகை', Seva: 'தொண்டு', Śraddha: 'நம்பிக்கை', Jñāna: 'அறிவு', Dhyāna: 'தியானம்', Dayā: 'கருணை', Krodha: 'கோபம்', Matsarya: 'பொறாமை', Lobha: 'பேராசை', Moha: 'மோகம்', Mada: 'கர்வம்', Ahaṅkāra: 'அகங்காரம்', Kāma: 'காமம்' },
    msg: {
      startVs: 'பிறப்பு, கட்டம் 1-இலிருந்து பயணம் — கிரீடூவுடன் பரமபதப் போட்டி!',
      startSolo: 'கடிகாரம் இயங்குகிறது — பிறப்பு, கட்டம் 1-இலிருந்து பயணம்!',
      move: '{e}: {v} → கட்டம் {p}',
      over: '{e}: {v} — {goal}க்கு சரியாக {n} வேண்டும், {p}-இல் நிற்கிறது',
      ladder: '{e}: {name} — {a} ↑ {b}',
      snake: '{e}: {name} — {a} ↓ {b}',
      six: 'ஆறு! {e} மீண்டும் உருட்டுக.',
      sixes: '{e}: தொடர் மூன்று ஆறுகள் — பேராசைக்குத் தண்டனை!',
      toastL: '{name}! {a} → {b}',
      toastS: '{name} கடித்தது! {a} → {b}',
      win: '{e} பரமபதம் அடைந்தது — முத்தி!',
    },
    bubble: {
      pre: ['கிரீடூ டை உருட்டுகிறது…', 'என் முறை!', 'கவனமாகப் பாருங்கள்.', 'இதோ உருட்டுகிறேன்!'],
      snake: ['ஐயோ — பாம்பு கடித்துவிட்டது!', 'பின்னோக்கிப் போகிறேன்…', 'இன்று பாவங்கள் கடுமை!'],
      ladder: ['மேலே ஏறுகிறேன்!', 'அறம் பயன் தரும்!', 'உச்சியில் சந்திப்போம்!'],
    },
    win: {
      placeYou: 'பரமபதம் அடைந்தேர்', placeK: 'கிரீடூ பரமபதம் அடைந்தது',
      titleYou: 'முத்தி கிடைத்தது!', titleK: 'கிரீடூ முதலில் வந்தது!',
      statsSolo: 'நேரம் {time} · டை {r}',
      statsVsYou: 'டை {r} · கிரீடூ கட்டம் {p}',
      statsVsK: 'டை {r} · நீங்கள் கட்டம் {p}',
      newBest: 'புதிய சாதனை!', best: 'சிறந்த நேரம்: {time}',
      noteY: 'ஒவ்வொரு அறமும் கைகொடுத்தது.',
      noteK: 'பாவங்கள் கடினமாகக் கடித்தன — ஒவ்வொரு பிறப்பும் புதிய வாய்ப்பு. மீண்டும் முயற்சி.',
      again: 'மீண்டும் விளையாடு', back: 'பின்செல்',
    },
    guide: {
      kicker: 'பலகை வழிகாட்டி · பரமபடம்',
      title: 'அறம்-பாவத்தின் வரைபடம்',
      aboutT: 'இந்தப் பலகையைப் பற்றி',
      about: 'பரமபடம் <strong>மோட்சப் படம்</strong> ("முத்திக்கான ஏணி")-இலிருந்தும் 19ஆம் நூற்றாண்டு சமண <strong>ஞான சௌபர்</strong> ஓவியங்களிலிருந்தும் வந்தது. இது ஓட்டப் பலகை அல்ல — நீதியின் வரைபடம்: ஒவ்வொரு கட்டமும் வாழ்வின் படி; அறங்கள் ஏணியாய் முத்தி நோக்கி ஏற்றும், பாவங்கள் (பாம்புகள்) இழுத்துக்கொண்டுவரும். கட்டம் 1 <strong>பிறப்பு</strong>; கட்டம் 100 <strong>பரமபதம்</strong>.',
      ladT: 'ஏழு ஏணிகள் — அறங்கள்',
      vicT: 'ஏழு பாம்புகள் — பாவங்கள்',
      th0: 'கட்டம்', th1: 'பெயர்', th2: 'பொருள்',
      rulesT: 'இங்கே விளையாடும் விதிகள்',
      rules: [
        'டை உருட்டி முன்னேறுங்கள். <strong>6 வந்தால் மறு வாய்ப்பு</strong> — ஆனால் தொடர் மூன்று 6 வாய்ப்பை இழக்கும்.',
        '<strong>அறம்</strong> ஏணியேற்றும்; <strong>பாவம்</strong> பாம்பு இறக்கும்.',
        '100-இல் <strong>சரியாக</strong> நிற்க வேண்டும் — அதிகமானால் அங்கே காத்திருப்பு.',
        'இருவரும் ஒரே கட்டத்தில் இருக்கலாம் — போர் அல்ல, யாத்திரை.',
        '<strong>தனி வீரர்</strong> முறையில் கடிகாரத்துடன்; கிரீடூவுடன் நேரடிப் போட்டி.',
      ],
    },
  },
  ml: {
    label: 'മലയാളം', name: 'സർപ്പപ്പടം', digits: '൦൧൨൩൪൫൬൭൮൯',
    you: 'നിങ്ങൾ', roll: 'ക്യൂബ് എറിയൂ',
    janma: { w: 'ജന്മം', t: 'Janma' }, moksha: { w: 'വൈകുണ്ഠം', t: 'Vaikuntham' },
    virt: { Vinaya: 'വിനയം', Dāna: 'ദാനം', Seva: 'സേവനം', Śraddha: 'ശ്രദ്ധ', Jñāna: 'ജ്ഞാനം', Dhyāna: 'ധ്യാനം', Dayā: 'ദയ' },
    vice: { Krodha: 'ക്രോധം', Matsarya: 'അസൂയ', Lobha: 'ലോഭം', Moha: 'മോഹം', Mada: 'മദം', Ahaṅkāra: 'അഹങ്കാരം', Kāma: 'കാമം' },
    mean: { Vinaya: 'വിനയം', Dāna: 'ദാനശീലം', Seva: 'സേവനം', Śraddha: 'വിശ്വാസം', Jñāna: 'ജ്ഞാനം', Dhyāna: 'ധ്യാനം', Dayā: 'കരുണ', Krodha: 'ക്രോധം', Matsarya: 'അസൂയ', Lobha: 'ദുരാശ', Moha: 'മോഹം', Mada: 'ഗർവ്വം', Ahaṅkāra: 'അഹങ്കാരം', Kāma: 'കാമം' },
    msg: {
      startVs: 'യാത്ര ജന്മം (ഗുണ്ടം 1) മുതൽ — ക്രീഡുവുമായി വൈകുണ്ഠത്തിലേക്ക്!',
      startSolo: 'ക്ലോക്ക് ഓടുന്നു — യാത്ര ജന്മം, ഗുണ്ടം 1 മുതൽ ആരംഭിക്കുന്നു!',
      move: '{e}: {v} → ഗുണ്ടം {p}',
      over: '{e}: {v} — {goal}ക്ക് കൃത്യമായി {n} വേണം, {p}-ൽ നിന്നു',
      ladder: '{name} {e}-യെ ഉയർത്തി: {a} ↑ {b}',
      snake: '{name} {e}-യെ കടിച്ചു: {a} ↓ {b}',
      six: 'ആറ്! {e} വീണ്ടും എറിയട്ടെ.',
      sixes: '{e}: തുടർച്ചയായ മൂന്ന് ആറുകൾ — ലോഭത്തിന് ശിക്ഷ, ടേൺ നഷ്ടം!',
      toastL: '{name}! {a} → {b}',
      toastS: '{name} കടിച്ചു! {a} → {b}',
      win: '{e} വൈകുണ്ഠം എത്തി — മോക്ഷം നേടി!',
    },
    bubble: {
      pre: ['ക്രീഡു ക്യൂബ് ഇളക്കുന്നു…', 'എന്റെ ടേൺ!', 'ശ്രദ്ധിച്ചു നോക്കൂ.', 'ഞാൻ പോകുന്നു!'],
      snake: ['ഓ — പാമ്പ് കടിച്ചു!', 'പിന്നോട്ട് പോകുന്നു…', 'ഇന്ന് പാപങ്ങൾ ക്രൂരമാണ്!'],
      ladder: ['മുകളിലേക്ക് കയറുന്നു!', 'പുണ്യം ഫലം തരുന്നു!', 'മുകളിൽ കാണാം!'],
    },
    win: {
      placeYou: 'വൈകുണ്ഠം എത്തി', placeK: 'ക്രീഡു വൈകുണ്ഠം എത്തി',
      titleYou: 'മോക്ഷം നേടി!', titleK: 'ക്രീഡു ആദ്യം എത്തി!',
      statsSolo: 'സമയം {time} · എറികൾ {r}',
      statsVsYou: 'എറികൾ {r} · ക്രീഡു ഗുണ്ടം {p}-ൽ',
      statsVsK: 'എറികൾ {r} · നിങ്ങൾ ഗുണ്ടം {p}-ൽ',
      newBest: 'പുതിയ റെക്കോർഡ്!', best: 'മികച്ചത്: {time}',
      noteY: 'ഓരോ പുണ്യവും ഫലം തന്നു.',
      noteK: 'പാപങ്ങൾ കടുത്തു — പക്ഷേ ഓരോ ജന്മവും പുതിയ അവസരം. വീണ്ടും ശ്രമിക്കൂ.',
      again: 'വീണ്ടും കളിക്കൂ', back: 'ഗേം വിവരത്തിലേക്ക്',
    },
    guide: {
      kicker: 'ബോർഡ് ഗൈഡ് · സർപ്പപ്പടം',
      title: 'പുണ്യ-പാപ മാപ്പ്',
      aboutT: 'ഈ ബോർഡിനെ കുറിച്ച്',
      about: 'സർപ്പപ്പടം <strong>മോക്ഷപ്പടം</strong> ("മോക്ഷത്തിലേക്കുള്ള പടി") യിൽ നിന്നും 19-ാം നൂറ്റാണ്ടിലെ ജൈൻ <strong>ജ്ഞാന ചൗപർ</strong> ചിത്രങ്ങളിൽ നിന്നും ഉത്ഭവിച്ചതാണ്. ഇത് ഒരു മത്സര ബോർഡല്ല — നീതിയുടെ മാപ്പാണ്: ഓരോ ഗുണ്ടവും ജീവിതത്തിന്റെ ഒരു ഘട്ടം; പുണ്യങ്ങൾ മോക്ഷത്തിലേക്ക് ഉയർത്തുന്ന പടികളും, പാപങ്ങൾ (പാമ്പുകൾ) പിന്നിലേക്ക് വലിക്കുന്നവയും. ഗുണ്ടം 1 <strong>ജന്മം</strong>; ഗുണ്ടം 100 <strong>വൈകുണ്ഠം</strong>.',
      ladT: 'ഏഴ് പടികൾ — പുണ്യങ്ങൾ',
      vicT: 'ഏഴ് പാമ്പുകൾ — പാപങ്ങൾ',
      th0: 'ഗുണ്ടം', th1: 'പേര്', th2: 'അർത്ഥം',
      rulesT: 'ഇവിടെ കളിക്കുന്ന നിയമങ്ങൾ',
      rules: [
        'ക്യൂബ് എറിഞ്ഞ് മുന്നേറുക. <strong>6 വന്നാൽ വീണ്ടും ഒരു എറിയ്</strong> — പക്ഷേ തുടർച്ചയായ മൂന്ന് 6 ടേൺ നഷ്ടമാകും.',
        '<strong>പുണ്യം</strong> പടി കയറ്റും; <strong>പാപം</strong> പാമ്പ് താഴ്ത്തും.',
        '100-ൽ <strong>കൃത്യമായി</strong> ഇറങ്ങണം — അധികമായാൽ അവിടെ കാത്തിരിക്കും.',
        'രണ്ടുപേർക്കും ഒരേ ഗുണ്ടത്തിൽ ഇരിക്കാം — യുദ്ധമല്ല, തീർത്ഥയാത്ര.',
        '<strong>ഒറ്റയ്ക്ക്</strong> മോഡിൽ ക്ലോക്കുമായി; ക്രീഡുവുമായി നേരിട്ട് മത്സരം.',
      ],
    },
  },
}

const LANG_KEY = 'kreeda-vp-lang'

export function loadLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY) as Lang | null
    if (saved && LANGS.includes(saved)) return saved
  } catch {
    /* storage unavailable */
  }
  return 'en'
}

export function saveLang(l: Lang): void {
  try {
    localStorage.setItem(LANG_KEY, l)
  } catch {
    /* storage unavailable */
  }
}

export function vpLoc(lang: Lang, n: number): string {
  const d = VP_I18N[lang].digits
  return String(n).replace(/\d/g, (x) => d[+x])
}

/* ---------- Shell UI strings ---------- */

export interface ShellStrings {
  heroTitle1: string
  heroTitle2: string
  heroP: string
  heroSpeech: string
  chooseGame: string
  soloOrVs: string
  vsKreedu: string
  explore: string
  backToAll: string
  solo: string
  wherePlayed: string
  howToPlay: string
  playBtn: string
  backToGameInfo: string
  stitchedLine: string
  scatteredPins: string
  playSubtitle: string
  loaded: string
}

export const SHELL_I18N: Record<Lang, ShellStrings> = {
  te: {
    heroTitle1: 'ఆరు ఆటలు. వెయ్యి సంవత్సరాలు.',
    heroTitle2: 'ప్రతి దానికి ఒక పటం.',
    heroP: 'ఇక్కడి ప్రతి ఆట భారతదేశంలో పుట్టింది — కొన్ని ఇంటి దగ్గరే ఉండిపోయాయి, కొన్ని సముద్రాలు దాటి కొత్త పేర్లతో తిరిగి వచ్చాయి. ఎక్కడ ఉందో చూడండి.',
    heroSpeech: 'నమస్కారం! నేను క్రీడూ — ఒక ఆట ఎంచుకోండి, మీతో ఆడతాను 🎲',
    chooseGame: 'ఒక ఆట ఎంచుకోండి',
    soloOrVs: 'సోలో లేదా క్రీడూతో',
    vsKreedu: 'క్రీడూతో',
    explore: 'అన్వేషించు →',
    backToAll: '← అన్ని ఆటలకు',
    solo: 'సోలో',
    wherePlayed: 'ఎక్కడ ఆడతారు',
    howToPlay: 'ఎలా ఆడాలి',
    playBtn: '▶ ఆడు',
    backToGameInfo: '← గేమ్ సమాచారం',
    stitchedLine: 'అనుసంధాన దారం ప్రయాణాన్ని చూపిస్తుంది',
    scatteredPins: 'చెల్లాచెదరైన పిన్లు — మూలం ఒక్కటి కాదు',
    playSubtitle: 'బోర్డు మరియు గేమ్ లజిక్ ఇక్కడ కనిపిస్తుంది.',
    loaded: 'లోడ్ అయింది: {g} ({m})',
  },
  en: {
    heroTitle1: 'Six games. A thousand years.',
    heroTitle2: 'One board each.',
    heroP: 'Every game here was born in India — some stayed close to home, some crossed oceans and came back with new names. Tap a game to see where it\u2019s been.',
    heroSpeech: 'Namaste! I\u2019m Kreedu — pick a game and I\u2019ll play with you 🎲',
    chooseGame: 'Choose a game',
    soloOrVs: 'Solo or vs Kreedu',
    vsKreedu: 'vs Kreedu',
    explore: 'Explore →',
    backToAll: '← Back to all games',
    solo: 'Solo',
    wherePlayed: 'Where it\u2019s played',
    howToPlay: 'How to play',
    playBtn: '▶ Play',
    backToGameInfo: '← Back to game info',
    stitchedLine: 'stitched line traces its journey',
    scatteredPins: 'scattered pins — no single origin claimed',
    playSubtitle: 'Board and game logic mount here.',
    loaded: 'Loaded: {g} ({m})',
  },
  hi: {
    heroTitle1: 'छह खेल। हज़ार साल।',
    heroTitle2: 'हर एक का अपना पट।',
    heroP: 'यहाँ हर खेल भारत में जन्मा — कुछ घर के पास रहे, कुछ समुद्र पार करके नए नामों से लौटे। देखने के लिए टैप करें।',
    heroSpeech: 'नमस्ते! मैं क्रीड़ू — कोई खेल चुनिए, मैं आपके साथ खेलूँगा 🎲',
    chooseGame: 'एक खेल चुनें',
    soloOrVs: 'अकेले या क्रीड़ू के साथ',
    vsKreedu: 'क्रीड़ू के साथ',
    explore: 'खोजें →',
    backToAll: '← सभी खेलों पर वापस',
    solo: 'अकेले',
    wherePlayed: 'कहाँ खेला जाता है',
    howToPlay: 'कैसे खेलें',
    playBtn: '▶ खेलें',
    backToGameInfo: '← खेल जानकारी',
    stitchedLine: 'जुड़ी धागा यात्रा दिखाता है',
    scatteredPins: 'बिखरे पिन — कोई एक मूल नहीं',
    playSubtitle: 'बोर्ड और खेम तर्क यहाँ दिखता है।',
    loaded: 'लोड: {g} ({m})',
  },
  ta: {
    heroTitle1: 'ஆறு விளையாட்டுகள். ஆயிரம் ஆண்டுகள்.',
    heroTitle2: 'ஒவ்வொன்றுக்கும் ஒரு பலகை.',
    heroP: 'இங்குள்ள ஒவ்வொரு விளையாட்டும் இந்தியாவில் பிறந்தது — சில வீட்டிலேயே இருந்தன, சில கடல்களைக் கடந்து புதிய பெயர்களுடன் திரும்பின. எங்கே இருந்தது பாருங்கள்.',
    heroSpeech: 'வணக்கம்! நான் கிரீடூ — ஒரு விளையாட்டைத் தேர்ந்தெடுங்கள், உங்களுடன் விளையாடுகிறேன் 🎲',
    chooseGame: 'ஒரு விளையாட்டைத் தேர்ந்தெடுங்கள்',
    soloOrVs: 'தனி அல்லது கிரீடூவுடன்',
    vsKreedu: 'கிரீடூவுடன்',
    explore: 'ஆராய →',
    backToAll: '← அனைத்து விளையாட்டுகளுக்கும்',
    solo: 'தனி',
    wherePlayed: 'எங்கே விளையாடுகிறார்கள்',
    howToPlay: 'எப்படி விளையாடுவது',
    playBtn: '▶ விளையாடு',
    backToGameInfo: '← விளையாட்டுத் தகவல்',
    stitchedLine: 'தைக்கப்பட்ட நூல் பயணத்தைக் காட்டுகிறது',
    scatteredPins: 'சிதறிய பின்கள் — ஒரே மூலம் இல்லை',
    playSubtitle: 'பலகை மற்றும் விளையாட்டு தருக்கம் இங்கே தெரியும்.',
    loaded: 'ஏற்றப்பட்டது: {g} ({m})',
  },
  ml: {
    heroTitle1: 'ആറ് കളികൾ. ആയിരം വർഷം.',
    heroTitle2: 'ഓരോന്നിനും ഒരു ബോർഡ്.',
    heroP: 'ഇവിടുത്തെ ഓരോ കളിയും ഇന്ത്യയിൽ ജനിച്ചതാണ് — ചിലത് വീട്ടിനടുത്ത് തന്നെ നിന്നു, ചിലത് സമുദ്രം കടന്ന് പുതിയ പേരുകളുമായി തിരിച്ചുവന്നു. എവിടെയായിരുന്നു നോക്കൂ.',
    heroSpeech: 'നമസ്കാരം! ഞാൻ ക്രീഡു — ഒരു കളി തിരഞ്ഞെടുക്കൂ, ഞാൻ നിങ്ങളോടൊപ്പം കളിക്കാം 🎲',
    chooseGame: 'ഒരു കളി തിരഞ്ഞെടുക്കൂ',
    soloOrVs: 'ഒറ്റയ്ക്കോ ക്രീഡുവുമായോ',
    vsKreedu: 'ക്രീഡുവുമായി',
    explore: 'അന്വേഷിക്കൂ →',
    backToAll: '← എല്ലാ കളികളിലേക്കും',
    solo: 'ഒറ്റയ്ക്ക്',
    wherePlayed: 'എവിടെ കളിക്കുന്നു',
    howToPlay: 'എങ്ങനെ കളിക്കാം',
    playBtn: '▶ കളിക്കൂ',
    backToGameInfo: '← കളി വിവരം',
    stitchedLine: 'തുന്നിയ നൂൽ യാത്ര കാണിക്കുന്നു',
    scatteredPins: 'ചിതറിയ പിൻന് — ഒരു മൂലം അവകാശപ്പെടുന്നില്ല',
    playSubtitle: 'ബോർഡും കളി ലോജിക്കും ഇവിടെ കാണാം.',
    loaded: 'ലോഡ് ചെയ്തു: {g} ({m})',
  },
}
