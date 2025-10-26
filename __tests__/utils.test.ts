import { generateRoomId, rollDice, getDiceTypeName, getDiceEmoji } from '@/lib/utils'

describe('Utils Functions', () => {
    test('generateRoomId should return 6 character string', () => {
        const roomId = generateRoomId()
        expect(roomId).toHaveLength(6)
        expect(/^[A-Z0-9]+$/.test(roomId)).toBe(true)
    })

    test('rollDice should return correct number of results', () => {
        const { results, total } = rollDice(6, 3)
        expect(results).toHaveLength(3)
        expect(total).toBe(results.reduce((sum, result) => sum + result, 0))
        expect(results.every(result => result >= 1 && result <= 6)).toBe(true)
    })

    test('getDiceTypeName should return correct format', () => {
        expect(getDiceTypeName(6)).toBe('d6')
        expect(getDiceTypeName(20)).toBe('d20')
    })

    test('getDiceEmoji should return emoji for known types', () => {
        expect(getDiceEmoji(6)).toBe('🎲')
        expect(getDiceEmoji(20)).toBe('🎲')
        expect(getDiceEmoji(4)).toBe('🔺')
    })
})
