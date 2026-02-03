export const BLOCKED_KEYWORDS = [
    'shibal', 'ssibal', 'fuck', 'shit', 'bitch', 'idiot',
    '섹스', '도박', '카지노', '바카라', '대출', '성인',
    '시발', '씨발', '개새끼', '병신', '지랄', '좆', '창녀'
]

export function containsProfanity(text: string): boolean {
    const lowerText = text.toLowerCase()
    return BLOCKED_KEYWORDS.some(keyword => lowerText.includes(keyword))
}
