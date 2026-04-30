export type Grade = { id: string; title: string; subtitle: string }
export type LessonTopic = { id: string; gradeId: string; title: string; subtitle: string }
export type Lesson = {
  id: string
  gradeId: string
  topicId: string
  title: string
  minutes: number
  content: string
  quiz: {
    question: string
    options: { id: string; label: string; correct: boolean }[]
    explanation: string
  }
}

const q = (question: string, options: { id: string; label: string; correct: boolean }[], explanation: string) => ({
  question,
  options,
  explanation,
})

const lesson = (args: Omit<Lesson, 'minutes'> & { minutes?: number }): Lesson => ({
  minutes: args.minutes ?? 7,
  ...args,
})

type TopicBlueprint = { slug: string; title: string; subtitle: string; lessonsPerTopic: number }
type GradeBlueprint = { gradeId: string; topics: TopicBlueprint[] }

const tjNum = (n: number) => String(n)

function stablePick<T>(arr: T[], seed: number): T {
  const idx = Math.abs(seed) % arr.length
  return arr[idx]!
}

function makeMicroQuiz(gradeId: string, topicTitle: string, lessonNo: number) {
  const concepts = [
    'таъриф',
    'мисол',
    'аломат',
    'вазифа',
    'сабаб',
    'натиҷа',
    'қоида',
    'муқоиса',
    'таҷриба',
    'бехатарӣ',
    'муҳофизат',
    'мутобиқшавӣ',
  ]
  const good = stablePick(concepts, lessonNo + Number(gradeId) * 11)
  const bad = stablePick(concepts, lessonNo + Number(gradeId) * 17 + 3)
  return q(
    `Барои дарси “${topicTitle}” кадомаш бештар ба ${good} дахл дорад?`,
    [
      { id: 'a', label: good[0]!.toUpperCase() + good.slice(1), correct: true },
      { id: 'b', label: bad[0]!.toUpperCase() + bad.slice(1), correct: false },
      { id: 'c', label: 'Тасодуф', correct: false },
      { id: 'd', label: 'Ҳеҷ яке', correct: false },
    ],
    `Дар ин микро‑дарс мо бештар ${good}-ро меомӯзем.`,
  )
}

function makeMicroLessonContent(gradeId: string, topicTitle: string, n: number) {
  const focus = [
    'таъриф ва истилоҳҳо',
    'мисолҳо аз ҳаёти ҳаррӯза',
    'робитаи сабаб‑натиҷа',
    'қоидаҳои асосӣ',
    'хатогиҳои маъмул',
    'чӣ гуна дар таҷриба санҷидан',
    'хулосаи кӯтоҳ',
  ]
  const f = stablePick(focus, n + Number(gradeId) * 7)
  return [
    `Ин дарс аз мавзӯи “${topicTitle}” мебошад (синфи ${gradeId}).`,
    `Мақсад: фаҳмидани ${f}.`,
    '',
    `Нуктаҳо:`,
    `- Мафҳумро бо ҷумлаи содда шарҳ медиҳем.`,
    `- 1–2 мисол меорем ва кӯтоҳ хулоса мекунем.`,
  ].join('\n')
}

export const grades: Grade[] = [
  { id: '5', title: 'Синфи 5', subtitle: 'Шиносоӣ бо ҳаёт ва организмҳо' },
  { id: '6', title: 'Синфи 6', subtitle: 'Наботот (растаниҳо) ва занбӯруғҳо' },
  { id: '7', title: 'Синфи 7', subtitle: 'Зоология (ҳайвонот)' },
  { id: '8', title: 'Синфи 8', subtitle: 'Анатомия ва физиологияи инсон (I)' },
  { id: '9', title: 'Синфи 9', subtitle: 'Анатомия ва физиологияи инсон (II) + саломатӣ' },
  { id: '10', title: 'Синфи 10', subtitle: 'Генетика, эволютсия, биологияи умумӣ' },
  { id: '11', title: 'Синфи 11', subtitle: 'Экология, биотехнология ва такрори умумӣ' },
]

export const topics: LessonTopic[] = [
  // Grade 5
  { id: 'g5-intro', gradeId: '5', title: 'Биология чист?', subtitle: 'Илм дар бораи ҳаёт' },
  { id: 'g5-cells', gradeId: '5', title: 'Ҳуҷайра', subtitle: 'Воҳиди асосии ҳаёт' },
  { id: 'g5-microbes', gradeId: '5', title: 'Микроорганизмҳо', subtitle: 'Бактерияҳо ва вирусҳо (асосӣ)' },
  { id: 'g5-ecology', gradeId: '5', title: 'Муҳит', subtitle: 'Зинда ва ғайризинда' },
  { id: 'g5-health', gradeId: '5', title: 'Гигиена', subtitle: 'Одатҳои солим' },

  // Grade 6
  { id: 'g6-plants', gradeId: '6', title: 'Растаниҳо', subtitle: 'Сохтор ва гурӯҳҳо' },
  { id: 'g6-photosyn', gradeId: '6', title: 'Фотосинтез', subtitle: 'Энергия аз офтоб' },
  { id: 'g6-fungi', gradeId: '6', title: 'Занбӯруғҳо', subtitle: 'Нақш дар табиат' },
  { id: 'g6-plant-repro', gradeId: '6', title: 'Нашри растанӣ', subtitle: 'Гул, тухм, гардолудшавӣ' },

  // Grade 7
  { id: 'g7-animals', gradeId: '7', title: 'Ҳайвонот', subtitle: 'Гурӯҳбандӣ' },
  { id: 'g7-invert', gradeId: '7', title: 'Бемӯҳраҳо', subtitle: 'Ҳашарот, кирмҳо, моллюскҳо' },
  { id: 'g7-verte', gradeId: '7', title: 'Мӯҳрадорон', subtitle: 'Моҳӣ, амфибия, хазанда, парранда, ширхӯр' },
  { id: 'g7-adapt', gradeId: '7', title: 'Мутобиқшавӣ', subtitle: 'Муҳит ва рафтор' },

  // Grade 8
  { id: 'g8-human-cells', gradeId: '8', title: 'Бофтаҳо ва узвҳо', subtitle: 'Системаи узвҳо' },
  { id: 'g8-skeleton', gradeId: '8', title: 'Системаи устухон', subtitle: 'Устухонҳо ва буғумҳо' },
  { id: 'g8-muscles', gradeId: '8', title: 'Системаи мушак', subtitle: 'Ҳаракат ва қувва' },
  { id: 'g8-digestion', gradeId: '8', title: 'Ҳозима', subtitle: 'Ғизо ва ҳазм' },

  // Grade 9
  { id: 'g9-blood', gradeId: '9', title: 'Хун ва гардиши хун', subtitle: 'Дил ва рагҳо' },
  { id: 'g9-breath', gradeId: '9', title: 'Нафаскашӣ', subtitle: 'Шуш ва мубодилаи газ' },
  { id: 'g9-nerve', gradeId: '9', title: 'Асаб', subtitle: 'Мағзи сар ва ҳис' },
  { id: 'g9-endocrine', gradeId: '9', title: 'Эндокринӣ', subtitle: 'Гормонҳо' },
  { id: 'g9-immunity', gradeId: '9', title: 'Иммунитет', subtitle: 'Муҳофизати организм' },

  // Grade 10
  { id: 'g10-dna', gradeId: '10', title: 'ДНК ва репликация', subtitle: 'Асоси молекулавӣ' },
  { id: 'g10-heredity', gradeId: '10', title: 'Қонунҳои Мендел', subtitle: 'Ирсият' },
  { id: 'g10-evolution', gradeId: '10', title: 'Эволютсия', subtitle: 'Интихоби табиӣ' },
  { id: 'g10-ecology', gradeId: '10', title: 'Экологияи умумӣ', subtitle: 'Аҳолӣ ва экосистема' },

  // Grade 11
  { id: 'g11-ecosystems', gradeId: '11', title: 'Экосистемаҳо', subtitle: 'Занҷири ғизоӣ ва даврзанӣ' },
  { id: 'g11-human-impact', gradeId: '11', title: 'Таъсири инсон', subtitle: 'Ифлосшавӣ ва иқлим' },
  { id: 'g11-biotech', gradeId: '11', title: 'Биотехнология', subtitle: 'ГМО, PCR, ваксина' },
  { id: 'g11-review', gradeId: '11', title: 'Такрор', subtitle: 'Омодагӣ ба имтиҳон' },
]

// NOTE: This is a broad, school-style curriculum (5–11). Each lesson is concise but covers the core idea.
const baseLessons: Lesson[] = [
  // --- Grade 5: Intro ---
  lesson({
    id: 'g5-what-is-bio',
    gradeId: '5',
    topicId: 'g5-intro',
    title: 'Биология — илм дар бораи ҳаёт',
    content: [
      'Биология илм дар бораи организмҳои зинда ва қонунҳои ҳаёт аст.',
      'Объектҳои омӯзиш: растаниҳо, ҳайвонот, инсон, микроорганизмҳо, экосистемаҳо.',
      'Усулҳо: мушоҳида, таҷриба, муқоиса, ченкунӣ, моделсозӣ.',
      'Биология ба тиб, кишоварзӣ ва ҳифзи табиат кӯмак мекунад.',
    ].join('\n'),
    quiz: q(
      'Кадом ҷавоб дуруст аст?',
      [
        { id: 'a', label: 'Биология илм дар бораи сангҳо аст', correct: false },
        { id: 'b', label: 'Биология илм дар бораи ҳаёт ва организмҳои зинда аст', correct: true },
        { id: 'c', label: 'Биология танҳо дар бораи кайҳон аст', correct: false },
        { id: 'd', label: 'Биология танҳо дар бораи техника аст', correct: false },
      ],
      'Биология ҳаёт ва организмҳои зиндаро меомӯзад.',
    ),
  }),
  lesson({
    id: 'g5-signs-of-life',
    gradeId: '5',
    topicId: 'g5-intro',
    title: 'Нишонаҳои организмҳои зинда',
    content: [
      'Нишонаҳо: ғизогирӣ, нафаскашӣ, ҳаракат, афзоиш, инкишоф, афзоишёбӣ (нашр), ҳис кардан, ихроҷ.',
      'Организмҳо ба муҳит ҷавоб медиҳанд (реаксия).',
      'Ҳуҷайра асоси сохт ва фаъолият мебошад.',
    ].join('\n'),
    quiz: q(
      'Кадомаш нишонаи зиндагонӣ аст?',
      [
        { id: 'a', label: 'Нафаскашӣ', correct: true },
        { id: 'b', label: 'Ҷилои металл', correct: false },
        { id: 'c', label: 'Ранги санг', correct: false },
        { id: 'd', label: 'Шикастани шиша', correct: false },
      ],
      'Нафаскашӣ ва мубодилаи моддаҳо нишонаҳои асосии ҳаётанд.',
    ),
  }),

  lesson({
    id: 'g5-safety-lab',
    gradeId: '5',
    topicId: 'g5-intro',
    title: 'Қоидаҳои бехатарӣ дар дарси биология',
    content: [
      'Ҳангоми таҷриба: тартиб ва тозагӣ — ҳатмист.',
      'Моддаҳои номаълумро чашидан/бӯй кардан манъ аст.',
      'Бо шиша, кордча ва асбобҳои тез эҳтиёт кунед.',
      'Пас аз кор: дастҳоро шустан, ҷойро ҷамъ кардан.',
    ].join('\n'),
    quiz: q(
      'Кадом амал нодуруст аст?',
      [
        { id: 'a', label: 'Дастҳоро пас аз таҷриба шустан', correct: false },
        { id: 'b', label: 'Моддаи номаълумро чашидан', correct: true },
        { id: 'c', label: 'Асбобҳоро бо эҳтиёт истифода бурдан', correct: false },
        { id: 'd', label: 'Ҷойро ҷамъ кардан', correct: false },
      ],
      'Моддаҳои номаълумро чашидан хатарнок аст.',
    ),
  }),

  // --- Grade 5: Cells ---
  lesson({
    id: 'g5-cell-unit',
    gradeId: '5',
    topicId: 'g5-cells',
    title: 'Ҳуҷайра — воҳиди асосӣ',
    content: [
      'Ҳуҷайра — хурдтарин воҳиди организм, ки қобилияти ҳаёт дорад.',
      'Прокариот: ядрои ҳақиқӣ нест (бактерия).',
      'Эукариот: ядро дорад (растанӣ/ҳайвон).',
      'Органеллаҳо вазифаҳои махсус доранд.',
    ].join('\n'),
    quiz: q(
      'Кадом гурӯҳ ядрои ҳақиқӣ надорад?',
      [
        { id: 'a', label: 'Эукариотҳо', correct: false },
        { id: 'b', label: 'Прокариотҳо', correct: true },
        { id: 'c', label: 'Растаниҳо', correct: false },
        { id: 'd', label: 'Ҳайвонот', correct: false },
      ],
      'Прокариотҳо (бактерияҳо) ядрои ҳақиқӣ надоранд.',
    ),
  }),
  lesson({
    id: 'g5-cell-organelles',
    gradeId: '5',
    topicId: 'g5-cells',
    title: 'Органеллаҳои муҳим (кӯтоҳ)',
    content: [
      'Ядро: ДНК ва идоракунии ҳуҷайра.',
      'Митохондрия: истеҳсоли энергия (АТФ).',
      'Рибосома: сохтани сафеда.',
      'Мембрана: назорати ворид/хориҷ.',
      'Девори ҳуҷайра (растанӣ): устуворӣ.',
    ].join('\n'),
    quiz: q(
      'Кадом органелла сафеда месозад?',
      [
        { id: 'a', label: 'Рибосома', correct: true },
        { id: 'b', label: 'Митохондрия', correct: false },
        { id: 'c', label: 'Ядро', correct: false },
        { id: 'd', label: 'Мембрана', correct: false },
      ],
      'Рибосома синтези сафедаро иҷро мекунад.',
    ),
  }),

  lesson({
    id: 'g5-microscope',
    gradeId: '5',
    topicId: 'g5-cells',
    title: 'Микроскоп: чӣ гуна истифода мекунем?',
    content: [
      'Микроскоп барои дидани объектҳои хурд истифода мешавад.',
      'Аввал калонкунии хурд → баъд калонкунӣ зиёд.',
      'Фокусро оҳиста танзим кунед, то тасвир равшан шавад.',
      'Линзаро бо коғази махсус тоза кунед.',
    ].join('\n'),
    quiz: q(
      'Аввал кадом калонкунӣ беҳтар аст?',
      [
        { id: 'a', label: 'Калонкунии хурд', correct: true },
        { id: 'b', label: 'Калонкунии калон', correct: false },
        { id: 'c', label: 'Фарқ надорад', correct: false },
        { id: 'd', label: 'Бе рӯшноӣ', correct: false },
      ],
      'Аввал калонкунии хурд барои ёфтани объект осонтар аст.',
    ),
  }),

  // --- Grade 5: Microbes ---
  lesson({
    id: 'g5-bacteria',
    gradeId: '5',
    topicId: 'g5-microbes',
    title: 'Бактерияҳо: фоида ва зарар',
    content: [
      'Бактерияҳо якҳуҷайраанд, зуд зиёд мешаванд.',
      'Фоида: таҷзия (табиатро тоза мекунад), ферментатсия (йогурт), микрофлораи рӯда.',
      'Зарар: баъзеҳо беморӣ меоранд (ангина, сил ва ғ.).',
      'Тозагӣ ва ваксинаҳо муҳофизат мекунанд.',
    ].join('\n'),
    quiz: q(
      'Кадом мисол фоидаи бактерияҳост?',
      [
        { id: 'a', label: 'Йогурт ва туршкунӣ', correct: true },
        { id: 'b', label: 'Занг задани оҳан', correct: false },
        { id: 'c', label: 'Шикастани санг', correct: false },
        { id: 'd', label: 'Чароғи барқ', correct: false },
      ],
      'Ферментатсия (йогурт) бо иштироки бактерияҳо мешавад.',
    ),
  }),

  lesson({
    id: 'g5-viruses',
    gradeId: '5',
    topicId: 'g5-microbes',
    title: 'Вирусҳо (фаҳмиши оддӣ)',
    content: [
      'Вирус аз ҳуҷайра хурдтар аст ва танҳо дар дохили ҳуҷайра зиёд мешавад.',
      'Баъзе вирусҳо беморӣ меоранд (масалан, грипп).',
      'Пешгирӣ: гигиена, дурӣ аз беморон, ваксина (барои баъзеҳо).',
    ].join('\n'),
    quiz: q(
      'Вирус одатан дар куҷо зиёд мешавад?',
      [
        { id: 'a', label: 'Дар ҳаво мустақилона', correct: false },
        { id: 'b', label: 'Дар дохили ҳуҷайра', correct: true },
        { id: 'c', label: 'Дар санг', correct: false },
        { id: 'd', label: 'Дар об бе ҳуҷайра', correct: false },
      ],
      'Вирус барои зиёдшавӣ ба ҳуҷайра ниёз дорад.',
    ),
  }),

  // --- Grade 5: Ecology / Health ---
  lesson({
    id: 'g5-living-nonliving',
    gradeId: '5',
    topicId: 'g5-ecology',
    title: 'Омилҳои зинда ва ғайризинда',
    content: [
      'Омилҳои ғайризинда: рӯшноӣ, ҳарорат, об, хок, ҳаво.',
      'Омилҳои зинда: растанӣ, ҳайвонот, микроорганизмҳо ва муносибатҳои онҳо.',
      'Муҳит ба афзоиш ва паҳншавии организм таъсир мекунад.',
    ].join('\n'),
    quiz: q(
      'Кадомаш омили ғайризинда аст?',
      [
        { id: 'a', label: 'Ҳарорат', correct: true },
        { id: 'b', label: 'Парранда', correct: false },
        { id: 'c', label: 'Занбӯруғ', correct: false },
        { id: 'd', label: 'Бактерия', correct: false },
      ],
      'Ҳарорат омили ғайризинда аст.',
    ),
  }),
  lesson({
    id: 'g5-hygiene-hands',
    gradeId: '5',
    topicId: 'g5-health',
    title: 'Гигиенаи дастҳо ва пешгирии беморӣ',
    content: [
      'Шустани дастҳо сироятҳоро кам мекунад.',
      'Вақтҳо: пеш аз хӯрок, пас аз кӯча, пас аз ҳоҷатхона.',
      'Камаш 20 сония бо собун ва об.',
    ].join('\n'),
    quiz: q(
      'Чаро шустани даст муҳим аст?',
      [
        { id: 'a', label: 'Барои зиёд кардани микробҳо', correct: false },
        { id: 'b', label: 'Барои кам кардани сироят', correct: true },
        { id: 'c', label: 'Барои тағйири ранги даст', correct: false },
        { id: 'd', label: 'Барои гарм кардани ҳаво', correct: false },
      ],
      'Шустани даст микробҳоро кам мекунад ва бемориҳоро пешгирӣ мекунад.',
    ),
  }),

  // --- Grade 6: Plants ---
  lesson({
    id: 'g6-plant-organs',
    gradeId: '6',
    topicId: 'g6-plants',
    title: 'Узвҳои растанӣ: реша, поя, барг',
    content: [
      'Реша: ҷабби об ва намакҳо, мустаҳкамкунӣ.',
      'Поя: такягоҳ ва гузариши моддаҳо.',
      'Барх: фотосинтез, нафаскашӣ, бухоршавӣ (транспирация).',
    ].join('\n'),
    quiz: q(
      'Вазифаи асосии реша чист?',
      [
        { id: 'a', label: 'Фотосинтез', correct: false },
        { id: 'b', label: 'Ҷабби об ва намакҳо', correct: true },
        { id: 'c', label: 'Садо баровардан', correct: false },
        { id: 'd', label: 'Парвоз кардан', correct: false },
      ],
      'Реша об ва намакҳои маъданиро ҷабб мекунад.',
    ),
  }),
  lesson({
    id: 'g6-plant-transport',
    gradeId: '6',
    topicId: 'g6-plants',
    title: 'Гузариши об ва моддаҳо дар растанӣ',
    content: [
      'Ксилема об ва намакҳоро аз реша ба барг мебарад.',
      'Флоэма моддаҳои органикиро (қанди ҳосилшуда) ба дигар қисмҳо мебарад.',
      'Транспирация ҳаракати обро қавӣ мекунад.',
    ].join('\n'),
    quiz: q(
      'Кадом бофта обро боло мебарад?',
      [
        { id: 'a', label: 'Ксилема', correct: true },
        { id: 'b', label: 'Флоэма', correct: false },
        { id: 'c', label: 'Эпител', correct: false },
        { id: 'd', label: 'Асаб', correct: false },
      ],
      'Ксилема об ва намакҳоро аз реша ба боло интиқол медиҳад.',
    ),
  }),
  lesson({
    id: 'g6-photosynthesis',
    gradeId: '6',
    topicId: 'g6-photosyn',
    title: 'Фотосинтез (асосӣ)',
    content: [
      'Фотосинтез — сохтани моддаҳои органикӣ аз CO₂ ва H₂O бо нури офтоб.',
      'Хлорофилл нури офтобро мегирад.',
      'Маҳсулот: глюкоза ва оксиген.',
      'Аҳамият: асоси занҷири ғизоӣ ва ҳавои оксигендор.',
    ].join('\n'),
    quiz: q(
      'Дар фотосинтез кадом газ ҳосил мешавад?',
      [
        { id: 'a', label: 'Оксиген', correct: true },
        { id: 'b', label: 'Азот', correct: false },
        { id: 'c', label: 'Гелий', correct: false },
        { id: 'd', label: 'Метан', correct: false },
      ],
      'Оксиген яке аз маҳсулоти фотосинтез аст.',
    ),
  }),
  lesson({
    id: 'g6-fungi-role',
    gradeId: '6',
    topicId: 'g6-fungi',
    title: 'Занбӯруғҳо: фоида, зарар, бехатарӣ',
    content: [
      'Фоида: таҷзия, хамиртуруш, баъзе доруҳо (антибиотикҳо).',
      'Зарар: заҳролудшавӣ аз занбӯруғи нодуруст, бемориҳои рустанӣ.',
      'Қоида: занбӯруғи номаълумро нахӯред.',
    ].join('\n'),
    quiz: q(
      'Қоидаи дуруст кадом аст?',
      [
        { id: 'a', label: 'Ҳар занбӯруғро метавон хӯрд', correct: false },
        { id: 'b', label: 'Занбӯруғи номаълумро нахӯрдан', correct: true },
        { id: 'c', label: 'Занбӯруғ дар офтоб фотосинтез мекунад', correct: false },
        { id: 'd', label: 'Занбӯруғ ба об эҳтиёҷ надорад', correct: false },
      ],
      'Номаълум метавонад заҳрнок бошад — нахӯред.',
    ),
  }),
  lesson({
    id: 'g6-flower-repro',
    gradeId: '6',
    topicId: 'g6-plant-repro',
    title: 'Гул ва гардолудшавӣ',
    content: [
      'Гул узви нашри растаниҳои гулдор аст.',
      'Гардолудшавӣ: гузаштани гард ба модагул (бо шамол ё ҳашарот).',
      'Пас аз бордоршавӣ тухм ва мева ба вуҷуд меояд.',
    ].join('\n'),
    quiz: q(
      'Гардолудшавӣ чӣ аст?',
      [
        { id: 'a', label: 'Гузаштани гард ба модагул', correct: true },
        { id: 'b', label: 'Бухор шудани об', correct: false },
        { id: 'c', label: 'Шикастани глюкоза', correct: false },
        { id: 'd', label: 'Ҳаракати мушак', correct: false },
      ],
      'Гардолудшавӣ пеш аз бордоршавӣ мешавад.',
    ),
  }),

  // --- Grade 7: Animals ---
  lesson({
    id: 'g7-classification',
    gradeId: '7',
    topicId: 'g7-animals',
    title: 'Гурӯҳбандии ҳайвонот (содда)',
    content: [
      'Ҳайвонот ба бемӯҳра ва мӯҳрадор ҷудо мешаванд.',
      'Бемӯҳраҳо: кирмҳо, ҳашарот, моллюскҳо ва ғ.',
      'Мӯҳрадорон: моҳӣ, амфибия, хазанда, парранда, ширхӯр.',
    ].join('\n'),
    quiz: q(
      'Кадомаш бемӯҳра аст?',
      [
        { id: 'a', label: 'Саг', correct: false },
        { id: 'b', label: 'Мурғ', correct: false },
        { id: 'c', label: 'Кирм', correct: true },
        { id: 'd', label: 'Моҳӣ', correct: false },
      ],
      'Кирмҳо бемӯҳра мебошанд.',
    ),
  }),
  lesson({
    id: 'g7-insects',
    gradeId: '7',
    topicId: 'g7-invert',
    title: 'Ҳашарот: сохтор ва аҳамият',
    content: [
      'Бадан: сар, сина, шикам; 3 ҷуфт по.',
      'Бисёр ҳашарот гардолудкунандаанд (занбӯр).',
      'Баъзеҳо зараррасонанд ё беморӣ интиқол медиҳанд.',
    ].join('\n'),
    quiz: q(
      'Ҳашарот чанд ҷуфт по дорад?',
      [
        { id: 'a', label: '1', correct: false },
        { id: 'b', label: '2', correct: false },
        { id: 'c', label: '3', correct: true },
        { id: 'd', label: '4', correct: false },
      ],
      'Ҳашарот 3 ҷуфт по дорад.',
    ),
  }),
  lesson({
    id: 'g7-vertebrates',
    gradeId: '7',
    topicId: 'g7-verte',
    title: 'Мӯҳрадорон: гурӯҳҳои асосӣ',
    content: [
      'Моҳӣ: дар об, шонак, нафаскашӣ бо гилс.',
      'Амфибия: об + хушкӣ, метаморфоз.',
      'Хазанда: пӯст хушк, тухм бо пӯст.',
      'Парранда: пар, парвоз, тухм.',
      'Ширхӯр: шир додан, ҳарорати устувор.',
    ].join('\n'),
    quiz: q(
      'Кадом гурӯҳ шир медиҳад?',
      [
        { id: 'a', label: 'Парранда', correct: false },
        { id: 'b', label: 'Ширхӯр', correct: true },
        { id: 'c', label: 'Моҳӣ', correct: false },
        { id: 'd', label: 'Хазанда', correct: false },
      ],
      'Ширхӯрон кӯдаки худро бо шир ғизо медиҳанд.',
    ),
  }),
  lesson({
    id: 'g7-adaptations',
    gradeId: '7',
    topicId: 'g7-adapt',
    title: 'Мутобиқшавӣ: мисолҳо',
    content: [
      'Мутобиқшавӣ ба зинда мондан кӯмак мекунад.',
      'Мисолҳо: ранги муҳофизатӣ, дандонҳои гуногун, муҳоҷират.',
      'Мутобиқшавӣ метавонад сохторӣ ё рафторӣ бошад.',
    ].join('\n'),
    quiz: q(
      'Муҳоҷират мисоли чӣ аст?',
      [
        { id: 'a', label: 'Мутобиқшавии рафторӣ', correct: true },
        { id: 'b', label: 'Фотосинтез', correct: false },
        { id: 'c', label: 'Нашри беҷинсӣ', correct: false },
        { id: 'd', label: 'Репликация', correct: false },
      ],
      'Муҳоҷират мутобиқшавии рафторӣ мебошад.',
    ),
  }),

  // --- Grade 8: Human ---
  lesson({
    id: 'g8-tissues',
    gradeId: '8',
    topicId: 'g8-human-cells',
    title: 'Бофтаҳо: намудҳо',
    content: [
      'Бофта — гурӯҳи ҳуҷайраҳо бо вазифаи муштарак.',
      'Намудҳо: эпителӣ, пайвандӣ, мушакӣ, асабӣ.',
      'Аз бофтаҳо узвҳо ва системаҳо сохта мешаванд.',
    ].join('\n'),
    quiz: q(
      'Кадом бофта сигнал мегузаронад?',
      [
        { id: 'a', label: 'Асабӣ', correct: true },
        { id: 'b', label: 'Пайвандӣ', correct: false },
        { id: 'c', label: 'Эпителӣ', correct: false },
        { id: 'd', label: 'Мушакӣ', correct: false },
      ],
      'Бофтаи асабӣ сигналҳоро интиқол медиҳад.',
    ),
  }),
  lesson({
    id: 'g8-skeleton-basics',
    gradeId: '8',
    topicId: 'g8-skeleton',
    title: 'Системаи устухон: вазифаҳо',
    content: [
      'Устухонҳо: такягоҳ, муҳофизат (сар/қалб), ҳаракат (бо мушак).',
      'Мағзи устухон: ҳосил кардани ҳуҷайраҳои хун.',
      'Буғумҳо: ҳаракати қисмҳои бадан.',
    ].join('\n'),
    quiz: q(
      'Яке аз вазифаҳои устухон кадом аст?',
      [
        { id: 'a', label: 'Муҳофизати узвҳо', correct: true },
        { id: 'b', label: 'Фотосинтез', correct: false },
        { id: 'c', label: 'Парвоз', correct: false },
        { id: 'd', label: 'Рӯшноӣ додан', correct: false },
      ],
      'Устухонҳо узвҳои муҳимро муҳофизат мекунанд.',
    ),
  }),
  lesson({
    id: 'g8-muscle-types',
    gradeId: '8',
    topicId: 'g8-muscles',
    title: 'Намудҳои мушак',
    content: [
      'Скелетӣ: ҳаракати ихтиёрӣ.',
      'Ҳамвор: узвҳои дохилӣ (ноихтиёрӣ).',
      'Дил: танҳо дар дил, доим кор мекунад.',
    ].join('\n'),
    quiz: q(
      'Кадом мушак танҳо дар дил аст?',
      [
        { id: 'a', label: 'Скелетӣ', correct: false },
        { id: 'b', label: 'Ҳамвор', correct: false },
        { id: 'c', label: 'Мушаки дил', correct: true },
        { id: 'd', label: 'Эпителӣ', correct: false },
      ],
      'Мушаки дил махсус буда, танҳо дар дил ҷойгир аст.',
    ),
  }),
  lesson({
    id: 'g8-digest-steps',
    gradeId: '8',
    topicId: 'g8-digestion',
    title: 'Марҳилаҳои ҳазм',
    content: [
      'Ҳазм: механикӣ (майдакунӣ) + кимиёвӣ (ферментҳо).',
      'Даҳон → меъда → рӯдаи борик (ҷаббиш) → рӯдаи ғафс.',
      'Оби кофӣ ва ғизои мувозинатнок барои ҳазм муҳим аст.',
    ].join('\n'),
    quiz: q(
      'Ҷаббиши асосии ғизо дар куҷост?',
      [
        { id: 'a', label: 'Рӯдаи борик', correct: true },
        { id: 'b', label: 'Даҳон', correct: false },
        { id: 'c', label: 'Рӯдаи ғафс', correct: false },
        { id: 'd', label: 'Шуш', correct: false },
      ],
      'Дар рӯдаи борик ҷаббиши асосии моддаҳои ғизоӣ мегузарад.',
    ),
  }),

  // --- Grade 9: Blood ---
  lesson({
    id: 'g9-heart-blood',
    gradeId: '9',
    topicId: 'g9-blood',
    title: 'Дил ва гардиши хун (кӯтоҳ)',
    content: [
      'Дил хунро ба бадан меронад.',
      'Артерияҳо хунро аз дил мебаранд, венаҳо ба дил меоранд.',
      'Хуни оксигендор одатан дар артерия, камоксиген — дар вена.',
      'Ду давра: хурд (шуш) ва калон (бадан).',
    ].join('\n'),
    quiz: q(
      'Венаҳо хунро ба куҷо меоранд?',
      [
        { id: 'a', label: 'Ба дил', correct: true },
        { id: 'b', label: 'Ба барг', correct: false },
        { id: 'c', label: 'Ба реша', correct: false },
        { id: 'd', label: 'Ба хок', correct: false },
      ],
      'Венаҳо хунро ба дил бармегардонанд.',
    ),
  }),

  // --- Grade 9: Respiration / Nervous / Immunity ---
  lesson({
    id: 'g9-lungs',
    gradeId: '9',
    topicId: 'g9-breath',
    title: 'Шуш ва мубодилаи газ',
    content: [
      'Алвеолаҳо ҷойи мубодилаи O₂ ва CO₂ мебошанд.',
      'Оксиген ба хун мегузарад, CO₂ аз хун хориҷ мешавад.',
      'Варзиш ва ҳавои тоза ба нафаскашӣ кӯмак мекунад.',
    ].join('\n'),
    quiz: q(
      'Мубодилаи газ бештар дар куҷо мегузарад?',
      [
        { id: 'a', label: 'Алвеолаҳо', correct: true },
        { id: 'b', label: 'Меъда', correct: false },
        { id: 'c', label: 'Пӯст', correct: false },
        { id: 'd', label: 'Устухон', correct: false },
      ],
      'Алвеолаҳо сатҳи калон барои мубодилаи газ доранд.',
    ),
  }),
  lesson({
    id: 'g9-brain',
    gradeId: '9',
    topicId: 'g9-nerve',
    title: 'Мағзи сар ва нейрон',
    content: [
      'Мағзи сар ҳаракат, хотира, фикр ва ҳисҳоро идора мекунад.',
      'Нейрон ҳуҷайраест, ки сигналро мегузаронад.',
      'Хоб ва ғизои дуруст барои мағз муҳим аст.',
    ].join('\n'),
    quiz: q(
      'Нейрон чӣ кор мекунад?',
      [
        { id: 'a', label: 'Сигнал мегузаронад', correct: true },
        { id: 'b', label: 'Оксиген месозад', correct: false },
        { id: 'c', label: 'Глюкоза месозад', correct: false },
        { id: 'd', label: 'Устухон месозад', correct: false },
      ],
      'Нейронҳо сигналҳои асабиро интиқол медиҳанд.',
    ),
  }),
  lesson({
    id: 'g9-immunity-basics',
    gradeId: '9',
    topicId: 'g9-immunity',
    title: 'Иммунитет: муҳофизат аз сироят',
    content: [
      'Муҳофизати аввал: пӯст ва луобпарда.',
      'Антителоҳо микробҳоро безарар мекунанд.',
      'Ваксина иммунитетро “омӯз” мекунад.',
    ].join('\n'),
    quiz: q(
      'Кадомаш муҳофизати аввал аст?',
      [
        { id: 'a', label: 'Пӯст', correct: true },
        { id: 'b', label: 'Дандон', correct: false },
        { id: 'c', label: 'Нохун', correct: false },
        { id: 'd', label: 'Мӯй', correct: false },
      ],
      'Пӯст монеаи аввалини муҳофизатӣ аст.',
    ),
  }),

  // --- Grade 10: Genetics ---
  lesson({
    id: 'g10-mendel-1',
    gradeId: '10',
    topicId: 'g10-heredity',
    title: 'Қонуни 1‑уми Мендел (як аломат)',
    content: [
      'Агар ду волид бо аломатҳои гуногун гузаронда шаванд, насли F1 одатан аломати доминантро нишон медиҳад.',
      'Генотип: AA, Aa, aa.',
      'Фенотип: аломати зоҳирӣ.',
    ].join('\n'),
    quiz: q(
      'Кадом генотип гетерозигот аст?',
      [
        { id: 'a', label: 'AA', correct: false },
        { id: 'b', label: 'Aa', correct: true },
        { id: 'c', label: 'aa', correct: false },
        { id: 'd', label: 'BB', correct: false },
      ],
      'Гетерозигот — ду аллели гуногун дорад (Aa).',
    ),
  }),

  // --- Grade 10: DNA / Evolution / Ecology ---
  lesson({
    id: 'g10-dna-structure',
    gradeId: '10',
    topicId: 'g10-dna',
    title: 'Сохтори ДНК (A–T, G–C)',
    content: [
      'ДНК аз нуклеотидҳо сохта шудааст: A, T, G, C.',
      'Ҷуфтшавӣ: A–T ва G–C.',
      'Маълумоти ирсӣ дар пайдарпаии нуклеотидҳо нигоҳ дошта мешавад.',
    ].join('\n'),
    quiz: q(
      'Ҷуфти дуруст кадом аст?',
      [
        { id: 'a', label: 'A–C', correct: false },
        { id: 'b', label: 'A–T', correct: true },
        { id: 'c', label: 'T–G', correct: false },
        { id: 'd', label: 'G–T', correct: false },
      ],
      'A бо T ва G бо C ҷуфт мешавад.',
    ),
  }),
  lesson({
    id: 'g10-natural-selection',
    gradeId: '10',
    topicId: 'g10-evolution',
    title: 'Интихоби табиӣ (асосӣ)',
    content: [
      'Дар популятсия гуногунӣ вуҷуд дорад.',
      'Беҳтар мутобиқшудаҳо бештар зинда мемонанд ва насл медиҳанд.',
      'Бо вақт хусусиятҳои популятсия тағйир меёбанд.',
    ].join('\n'),
    quiz: q(
      'Интихоби табиӣ ба чӣ асос меёбад?',
      [
        { id: 'a', label: 'Гуногунӣ ва наҷот', correct: true },
        { id: 'b', label: 'Барқ', correct: false },
        { id: 'c', label: 'Занг задани оҳан', correct: false },
        { id: 'd', label: 'Бе тағйир мондан', correct: false },
      ],
      'Гуногунӣ + афзалияти мутобиқшавӣ → интихоби табиӣ.',
    ),
  }),
  lesson({
    id: 'g10-population',
    gradeId: '10',
    topicId: 'g10-ecology',
    title: 'Популятсия: таваллуд ва марг',
    content: [
      'Популятсия — гурӯҳи як навъ дар як минтақа.',
      'Шумора аз таваллуд, марг, муҳоҷират вобаста аст.',
      'Захираҳо ва рақобат афзоишро маҳдуд мекунанд.',
    ].join('\n'),
    quiz: q(
      'Популятсия чӣ аст?',
      [
        { id: 'a', label: 'Як организм', correct: false },
        { id: 'b', label: 'Гурӯҳи як навъ дар як ҷой', correct: true },
        { id: 'c', label: 'Ҳамаи намудҳо дар ҷаҳон', correct: false },
        { id: 'd', label: 'Танҳо ҳашарот', correct: false },
      ],
      'Популятсия — як навъ дар як минтақа.',
    ),
  }),

  // --- Grade 11: Biotech ---
  lesson({
    id: 'g11-vaccines',
    gradeId: '11',
    topicId: 'g11-biotech',
    title: 'Ваксинаҳо: чӣ гуна кор мекунанд?',
    content: [
      'Ваксина системаи иммуниро “омӯз” мекунад.',
      'Антиген (заиф/қисм) → истеҳсоли антитело ва ҳуҷайраҳои хотира.',
      'Ҳангоми сирояти воқеӣ организм зуд ҷавоб медиҳад.',
      'Ваксинаҳо бемориҳоро кам мекунанд ва муҳофизати ҷамъиятӣ медиҳанд.',
    ].join('\n'),
    quiz: q(
      'Мақсади асосии ваксина чист?',
      [
        { id: 'a', label: 'Суст кардани нафаскашӣ', correct: false },
        { id: 'b', label: 'Омӯзонидани иммунитет барои муҳофизат', correct: true },
        { id: 'c', label: 'Баланд кардани ҳарорат ҳамеша', correct: false },
        { id: 'd', label: 'Тавлиди нур', correct: false },
      ],
      'Ваксина иммунитетро барои ҷавоби зуд омода мекунад.',
    ),
  }),
  lesson({
    id: 'g11-food-chains',
    gradeId: '11',
    topicId: 'g11-ecosystems',
    title: 'Занҷири ғизоӣ ва сатҳҳои трофикӣ',
    content: [
      'Истеҳсолкунанда → истеъмолкунанда → таҷзиякунанда.',
      'Энергия дар ҳар гузариш кам мешавад.',
      'Пирамидаи энергия: боло энергия камтар.',
    ].join('\n'),
    quiz: q(
      'Кӣ истеҳсолкунанда аст?',
      [
        { id: 'a', label: 'Растаниҳо', correct: true },
        { id: 'b', label: 'Гург', correct: false },
        { id: 'c', label: 'Моҳӣ', correct: false },
        { id: 'd', label: 'Занг', correct: false },
      ],
      'Растаниҳо моддаи органикӣ месозанд — истеҳсолкунандаанд.',
    ),
  }),
  lesson({
    id: 'g11-pollution',
    gradeId: '11',
    topicId: 'g11-human-impact',
    title: 'Ифлосшавӣ ва ҳифзи муҳит',
    content: [
      'Ифлосшавӣ ҳаво/об/хокро вайрон мекунад ва ба саломатӣ таъсир мерасонад.',
      'Қадамҳо: кам кардани партов, коркарди дубора, энергияҳои тоза.',
      'Ҳар шахс метавонад бо одатҳои дуруст кумак кунад.',
    ].join('\n'),
    quiz: q(
      'Кадом амал ба ҳифзи муҳит кумак мекунад?',
      [
        { id: 'a', label: 'Коркарди дубора', correct: true },
        { id: 'b', label: 'Партовро ба дарё партофтан', correct: false },
        { id: 'c', label: 'Сӯхтани пластик дар хона', correct: false },
        { id: 'd', label: 'Истеъмоли беҳад', correct: false },
      ],
      'Коркарди дубора партовро кам мекунад.',
    ),
  }),
  lesson({
    id: 'g11-general-review',
    gradeId: '11',
    topicId: 'g11-review',
    title: 'Такрор: мафҳумҳои асосӣ',
    content: [
      'Ҳуҷайра, ДНК/ген, фотосинтез, ҳазм, нафаскашӣ, гардиши хун, иммунитет, эволютсия, экосистема, биотехнология.',
      'Барои омодагӣ: ҳар рӯз 15–20 дақиқа такрор + тест.',
    ].join('\n'),
    quiz: q(
      'Кадом мафҳум ба “гуногунӣ ва наҷот” вобаста аст?',
      [
        { id: 'a', label: 'Интихоби табиӣ', correct: true },
        { id: 'b', label: 'Фотосинтез', correct: false },
        { id: 'c', label: 'Ҳозима', correct: false },
        { id: 'd', label: 'Транспирация', correct: false },
      ],
      'Интихоби табиӣ ба гуногунӣ ва мутобиқшавӣ такя мекунад.',
    ),
  }),
]

// Massive curriculum generator (>= 1200 lessons) using short Tajik micro-lessons
const gradeBlueprints: GradeBlueprint[] = [
  {
    gradeId: '5',
    topics: [
      { slug: 'g5-intro', title: 'Биология чист?', subtitle: 'Илм дар бораи ҳаёт', lessonsPerTopic: 45 },
      { slug: 'g5-cells', title: 'Ҳуҷайра', subtitle: 'Воҳиди асосии ҳаёт', lessonsPerTopic: 45 },
      { slug: 'g5-microbes', title: 'Микроорганизмҳо', subtitle: 'Бактерияҳо ва вирусҳо', lessonsPerTopic: 45 },
      { slug: 'g5-ecology', title: 'Муҳит', subtitle: 'Зинда ва ғайризинда', lessonsPerTopic: 45 },
      { slug: 'g5-health', title: 'Гигиена', subtitle: 'Одатҳои солим', lessonsPerTopic: 45 },
    ],
  },
  {
    gradeId: '6',
    topics: [
      { slug: 'g6-plants', title: 'Растаниҳо', subtitle: 'Сохтор ва гурӯҳҳо', lessonsPerTopic: 45 },
      { slug: 'g6-photosyn', title: 'Фотосинтез', subtitle: 'Энергия аз офтоб', lessonsPerTopic: 45 },
      { slug: 'g6-fungi', title: 'Занбӯруғҳо', subtitle: 'Нақш дар табиат', lessonsPerTopic: 45 },
      { slug: 'g6-plant-repro', title: 'Нашри растанӣ', subtitle: 'Гул, тухм, гардолудшавӣ', lessonsPerTopic: 45 },
      { slug: 'g6-plant-eco', title: 'Растаниҳо ва муҳит', subtitle: 'Мутобиқшавӣ ва муҳофизат', lessonsPerTopic: 45 },
    ],
  },
  {
    gradeId: '7',
    topics: [
      { slug: 'g7-animals', title: 'Ҳайвонот', subtitle: 'Гурӯҳбандӣ', lessonsPerTopic: 45 },
      { slug: 'g7-invert', title: 'Бемӯҳраҳо', subtitle: 'Ҳашарот, кирмҳо, моллюскҳо', lessonsPerTopic: 45 },
      { slug: 'g7-verte', title: 'Мӯҳрадорон', subtitle: 'Гурӯҳҳои асосӣ', lessonsPerTopic: 45 },
      { slug: 'g7-adapt', title: 'Мутобиқшавӣ', subtitle: 'Муҳит ва рафтор', lessonsPerTopic: 45 },
      { slug: 'g7-ethology', title: 'Рафтори ҳайвонот', subtitle: 'Ишора, ғизогирӣ, муҳоҷират', lessonsPerTopic: 45 },
    ],
  },
  {
    gradeId: '8',
    topics: [
      { slug: 'g8-human-cells', title: 'Бофтаҳо ва узвҳо', subtitle: 'Системаи узвҳо', lessonsPerTopic: 45 },
      { slug: 'g8-skeleton', title: 'Системаи устухон', subtitle: 'Устухонҳо ва буғумҳо', lessonsPerTopic: 45 },
      { slug: 'g8-muscles', title: 'Системаи мушак', subtitle: 'Ҳаракат ва қувва', lessonsPerTopic: 45 },
      { slug: 'g8-digestion', title: 'Ҳозима', subtitle: 'Ғизо ва ҳазм', lessonsPerTopic: 45 },
      { slug: 'g8-skin', title: 'Пӯст', subtitle: 'Муҳофизат ва ҳис', lessonsPerTopic: 45 },
    ],
  },
  {
    gradeId: '9',
    topics: [
      { slug: 'g9-blood', title: 'Хун ва гардиши хун', subtitle: 'Дил ва рагҳо', lessonsPerTopic: 45 },
      { slug: 'g9-breath', title: 'Нафаскашӣ', subtitle: 'Шуш ва мубодилаи газ', lessonsPerTopic: 45 },
      { slug: 'g9-nerve', title: 'Асаб', subtitle: 'Мағзи сар ва ҳис', lessonsPerTopic: 45 },
      { slug: 'g9-endocrine', title: 'Эндокринӣ', subtitle: 'Гормонҳо', lessonsPerTopic: 45 },
      { slug: 'g9-immunity', title: 'Иммунитет', subtitle: 'Муҳофизати организм', lessonsPerTopic: 45 },
    ],
  },
  {
    gradeId: '10',
    topics: [
      { slug: 'g10-dna', title: 'ДНК ва репликация', subtitle: 'Асоси молекулавӣ', lessonsPerTopic: 45 },
      { slug: 'g10-heredity', title: 'Қонунҳои Мендел', subtitle: 'Ирсият', lessonsPerTopic: 45 },
      { slug: 'g10-evolution', title: 'Эволютсия', subtitle: 'Интихоби табиӣ', lessonsPerTopic: 45 },
      { slug: 'g10-ecology', title: 'Экологияи умумӣ', subtitle: 'Аҳолӣ ва экосистема', lessonsPerTopic: 45 },
      { slug: 'g10-bio-chem', title: 'Биохимия (асосӣ)', subtitle: 'Сафеда, чарб, карбогидрат', lessonsPerTopic: 45 },
    ],
  },
  {
    gradeId: '11',
    topics: [
      { slug: 'g11-ecosystems', title: 'Экосистемаҳо', subtitle: 'Занҷири ғизоӣ ва даврзанӣ', lessonsPerTopic: 45 },
      { slug: 'g11-human-impact', title: 'Таъсири инсон', subtitle: 'Ифлосшавӣ ва иқлим', lessonsPerTopic: 45 },
      { slug: 'g11-biotech', title: 'Биотехнология', subtitle: 'ГМО, PCR, ваксина', lessonsPerTopic: 45 },
      { slug: 'g11-review', title: 'Такрор', subtitle: 'Омодагӣ ба имтиҳон', lessonsPerTopic: 45 },
      { slug: 'g11-bioethics', title: 'Биоэтика', subtitle: 'Қоидаҳо ва масъулият', lessonsPerTopic: 45 },
    ],
  },
]

function generateTopics(): LessonTopic[] {
  const extra: LessonTopic[] = []
  for (const g of gradeBlueprints) {
    for (const t of g.topics) {
      // If not already present in base `topics`, add it.
      if (!topics.some((x) => x.id === t.slug)) {
        extra.push({ id: t.slug, gradeId: g.gradeId, title: t.title, subtitle: t.subtitle })
      }
    }
  }
  return extra
}

function generateLessons(): Lesson[] {
  const gen: Lesson[] = []
  for (const g of gradeBlueprints) {
    for (const t of g.topics) {
      for (let i = 1; i <= t.lessonsPerTopic; i++) {
        const id = `gen-g${g.gradeId}-${t.slug}-l${tjNum(i)}`
        gen.push(
          lesson({
            id,
            gradeId: g.gradeId,
            topicId: t.slug,
            title: `${t.title}: микро‑дарс ${tjNum(i)}`,
            minutes: 5,
            content: makeMicroLessonContent(g.gradeId, t.title, i),
            quiz: makeMicroQuiz(g.gradeId, t.title, i),
          }),
        )
      }
    }
  }
  return gen
}

// Merge expanded topics + keep existing topics stable
export const expandedTopics: LessonTopic[] = [...topics, ...generateTopics()]

export const lessons: Lesson[] = [...baseLessons, ...generateLessons()]


