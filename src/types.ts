/**
 * 「拉了吗」数据模型
 *
 * 设计原则：
 * 1. 医学上尽量对齐 Bristol（布里斯托）大便性状量表，便于给出可信的解读；
 * 2. 所有枚举值用稳定字符串而非下标，方便导出数据与后续迁移；
 * 3. 记录只存本地（IndexedDB），不上传任何服务器。
 */

/** 布里斯托分型：1 最硬 → 7 最稀 */
export type BristolType = 't1' | 't2' | 't3' | 't4' | 't5' | 't6' | 't7'

/** 颜色 */
export type StoolColor = 'brown' | 'dark' | 'black' | 'red' | 'green' | 'yellow' | 'clay' | 'gray'

/** 分量 */
export type Amount = 'tiny' | 'little' | 'normal' | 'much'

/** 排便感觉 */
export type Effort = 'smooth' | 'normal' | 'straining' | 'painful' | 'incomplete'

/** 气味 */
export type Smell = 'none' | 'mild' | 'normal' | 'strong' | 'foul'

/** 出血情况 */
export type Blood = 'none' | 'paper' | 'drip' | 'mixed'

/** 腹部感受（拉完之后） */
export type Belly = 'relieved' | 'normal' | 'bloated' | 'pain'

/** 心情 */
export type Mood = 'great' | 'good' | 'ok' | 'bad' | 'awful'

/** 单次如厕记录 */
export interface PooRecord {
  /** uuid */
  id: string
  /** 归属日期 YYYY-MM-DD（本地时区），日历按此排布 */
  date: string
  /** 开始时间戳（ms） */
  startAt: number
  /** 结束时间戳（ms），手动补录时可能等于 startAt + durationSec*1000 */
  endAt: number
  /** 时长（秒） */
  durationSec: number
  /** 是否真的排便（"蹲了但没拉出来"也是重要数据） */
  produced: boolean

  /** 以下字段仅在 produced === true 时填写 */
  shape?: BristolType
  color?: StoolColor
  amount?: Amount
  effort?: Effort
  smell?: Smell
  blood?: Blood
  sticky?: boolean
  belly?: Belly
  mood?: Mood
  note?: string

  /** 创建/更新时间（ms） */
  createdAt: number
  updatedAt: number
}

export type RecordDraft = Omit<PooRecord, 'id' | 'createdAt' | 'updatedAt'>

/* ------------------------------------------------------------------ */
/* 选项元数据                                                          */
/* ------------------------------------------------------------------ */

export interface OptionMeta<T extends string = string> {
  value: T
  label: string
  emoji: string
  /** 图表/色块用色 */
  color: string
  /** 一句话解读 */
  hint?: string
}

export const BRISTOL_OPTIONS: OptionMeta<BristolType>[] = [
  { value: 't1', label: '硬球粒', emoji: '🌰', color: '#8C6239', hint: '一颗颗硬球，典型便秘信号' },
  { value: 't2', label: '块状', emoji: '🥔', color: '#9A7B4F', hint: '香肠状但表面凹凸，偏干' },
  { value: 't3', label: '裂纹肠', emoji: '🌭', color: '#B08D57', hint: '成形有裂纹，正常范围' },
  { value: 't4', label: '光滑肠', emoji: '🍌', color: '#C9A227', hint: '光滑柔软，教科书级理想型' },
  { value: 't5', label: '软块', emoji: '🍦', color: '#D9B34A', hint: '边缘清晰的软块，偏快' },
  { value: 't6', label: '糊状', emoji: '🥣', color: '#C98A4B', hint: '蓬松糊状，轻度腹泻' },
  { value: 't7', label: '水样', emoji: '💧', color: '#7FA9C4', hint: '完全是水，腹泻' },
]

export const COLOR_OPTIONS: OptionMeta<StoolColor>[] = [
  { value: 'brown', label: '棕色', emoji: '🟤', color: '#8C6239', hint: '健康常态' },
  { value: 'dark', label: '深褐', emoji: '🟫', color: '#5C3A21', hint: '偏深，可能与饮食或补铁有关' },
  { value: 'black', label: '黑色', emoji: '⚫', color: '#2F2A28', hint: '柏油样需警惕上消化道出血' },
  { value: 'red', label: '红色', emoji: '🔴', color: '#C0392B', hint: '鲜血多来自下消化道或痔疮' },
  { value: 'green', label: '绿色', emoji: '🟢', color: '#6E9B58', hint: '常见于大量绿叶菜或胆汁过快' },
  { value: 'yellow', label: '黄色', emoji: '🟡', color: '#D9A62E', hint: '偏油偏亮，可能脂肪吸收不良' },
  { value: 'clay', label: '陶土', emoji: '🧱', color: '#C9B8A8', hint: '灰白陶土色，警惕胆道问题' },
  { value: 'gray', label: '灰白', emoji: '⚪', color: '#B9B0A6', hint: '灰白需就医排查' },
]

export const AMOUNT_OPTIONS: OptionMeta<Amount>[] = [
  { value: 'tiny', label: '一点点', emoji: '🫘', color: '#CBB79B' },
  { value: 'little', label: '偏少', emoji: '🥜', color: '#BFA27E' },
  { value: 'normal', label: '正常', emoji: '🍠', color: '#A8845C' },
  { value: 'much', label: '很多', emoji: '🍞', color: '#8C6239' },
]

export const EFFORT_OPTIONS: OptionMeta<Effort>[] = [
  { value: 'smooth', label: '一泻而下', emoji: '✨', color: '#4F8A5B' },
  { value: 'normal', label: '顺畅', emoji: '🙂', color: '#7FA65C' },
  { value: 'straining', label: '费力', emoji: '😣', color: '#D9A62E' },
  { value: 'painful', label: '疼痛', emoji: '😖', color: '#C0392B' },
  { value: 'incomplete', label: '没拉干净', emoji: '🤔', color: '#8E7CC3' },
]

export const SMELL_OPTIONS: OptionMeta<Smell>[] = [
  { value: 'none', label: '几乎无味', emoji: '🌬️', color: '#9FC3C9' },
  { value: 'mild', label: '轻微', emoji: '🍃', color: '#8FB98F' },
  { value: 'normal', label: '正常', emoji: '💨', color: '#D9A62E' },
  { value: 'strong', label: '明显', emoji: '🔥', color: '#D97B29' },
  { value: 'foul', label: '恶臭', emoji: '☠️', color: '#8E4B4B' },
]

export const BLOOD_OPTIONS: OptionMeta<Blood>[] = [
  { value: 'none', label: '无', emoji: '✅', color: '#4F8A5B' },
  { value: 'paper', label: '纸上带血', emoji: '🩸', color: '#D97B29' },
  { value: 'drip', label: '滴血', emoji: '💧', color: '#C0392B' },
  { value: 'mixed', label: '混在便中', emoji: '⚠️', color: '#8E4B4B' },
]

export const BELLY_OPTIONS: OptionMeta<Belly>[] = [
  { value: 'relieved', label: '一身轻松', emoji: '😌', color: '#4F8A5B' },
  { value: 'normal', label: '没啥感觉', emoji: '😐', color: '#A3A093' },
  { value: 'bloated', label: '还是胀', emoji: '😮‍💨', color: '#D9A62E' },
  { value: 'pain', label: '肚子痛', emoji: '🤢', color: '#C0392B' },
]

export const MOOD_OPTIONS: OptionMeta<Mood>[] = [
  { value: 'great', label: '神清气爽', emoji: '😄', color: '#4F8A5B' },
  { value: 'good', label: '还不错', emoji: '😊', color: '#7FA65C' },
  { value: 'ok', label: '一般', emoji: '😐', color: '#A3A093' },
  { value: 'bad', label: '有点烦', emoji: '😕', color: '#C98A4B' },
  { value: 'awful', label: '难受', emoji: '😢', color: '#C0392B' },
]

/** 布里斯托分型的三类归并，用于统计解读 */
export function bristolGroup(t?: BristolType): 'constipation' | 'normal' | 'diarrhea' | undefined {
  if (!t) return undefined
  if (t === 't1' || t === 't2') return 'constipation'
  if (t === 't3' || t === 't4' || t === 't5') return 'normal'
  return 'diarrhea'
}

export function optionOf<T extends string>(list: OptionMeta<T>[], value?: T): OptionMeta<T> | undefined {
  if (!value) return undefined
  return list.find((o) => o.value === value)
}

export function labelOf<T extends string>(list: OptionMeta<T>[], value?: T): string {
  return optionOf(list, value)?.label ?? '未记录'
}

export function emojiOf<T extends string>(list: OptionMeta<T>[], value?: T): string {
  return optionOf(list, value)?.emoji ?? '❔'
}
