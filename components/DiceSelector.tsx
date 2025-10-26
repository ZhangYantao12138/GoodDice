'use client'

interface DiceSelectorProps {
    selectedType: number
    onTypeChange: (type: number) => void
    diceTypes: number[]
}

export default function DiceSelector({ selectedType, onTypeChange, diceTypes }: DiceSelectorProps) {
    return (
        <div className="mb-4">
            <label className="block text-white/90 text-lg font-medium mb-2">
                骰子类型
            </label>
            <div className="flex flex-wrap gap-1">
                {diceTypes.map((type) => (
                    <button
                        key={type}
                        onClick={() => onTypeChange(type)}
                        className={`flex-1 min-w-0 rounded-xl transition-all duration-200 flex items-center justify-center py-2 px-3 ${selectedType === type
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                            : 'glass text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        <span className="font-semibold text-sm">d{type}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
