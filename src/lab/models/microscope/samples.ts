export type MicroscopeSample = {
  id: string
  title: string
  subtitle: string
  /** Public URL to a real microscope image */
  imageUrl: string
  /** Info text shown in UI */
  info: string
  /** A “best focus” point 0..1 for this sample (simulated) */
  idealFocus: number
}

// Note: these are public links intended to load “real microscope images”.
// If a network blocks external images, users can still add their own images later.
export const microscopeSamples: MicroscopeSample[] = [
  {
    id: 'onion-epidermis',
    title: 'Пӯсти пиёз (эпидермис)',
    subtitle: 'Ҳуҷайраҳои растанӣ • микроскоп',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Onion_epidermal_cells.jpg',
    info:
      'Намуна: эпидермиси пиёз.\n' +
      'Чӣ мебинед: девори ҳуҷайра, шакли росткунҷа, баъзан ядро.\n' +
      'Маслиҳат: зумро зиёд кунед ва фокусро оҳиста танзим намоед.',
    idealFocus: 0.56,
  },
  {
    id: 'human-blood-smear',
    title: 'Хуни инсон (мазок)',
    subtitle: 'Эритроситҳо • микроскоп',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Red_blood_cells.jpg',
    info:
      'Намуна: мазоки хун.\n' +
      'Чӣ мебинед: эритроситҳо (дискшакл), баъзан лейкоситҳо.\n' +
      'Маслиҳат: равшаниро каме паст кунед, то контурҳо беҳтар намоён шаванд.',
    idealFocus: 0.52,
  },
  {
    id: 'pollen-grains',
    title: 'Донаҳои гард (pollen)',
    subtitle: 'Ботаника • микроскоп',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Pollen_grains.jpg',
    info:
      'Намуна: pollen.\n' +
      'Чӣ мебинед: заррачаҳои сферӣ/эллипсӣ бо сатҳи ноҳамвор.\n' +
      'Маслиҳат: фокусро дар атрофи арзиши миёна нигоҳ доред.',
    idealFocus: 0.6,
  },
]

export function getSampleById(id: string | null | undefined): MicroscopeSample {
  return microscopeSamples.find((s) => s.id === id) ?? microscopeSamples[0]!
}

