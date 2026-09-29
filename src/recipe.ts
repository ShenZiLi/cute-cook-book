export type Stage = 'ingredients' | 'prep' | 'cook' | 'finished'
export type Heat = '未开火' | '小火' | '中火' | '大火'
export type IngredientId = 'tomato' | 'egg' | 'oil' | 'salt' | 'sugar'

export interface Ingredient {
  id: IngredientId
  name: string
  amount: number
  unit: string
  display: string
  emoji: string
  optional?: boolean
}

export interface StepMaterial {
  id: IngredientId
  amount: number
  display: string
}

export interface RecipeStep {
  id: number
  stage: Stage
  title: string
  verb: string
  description: string
  cue: string
  preview: string
  handled?: StepMaterial[]
  additions: StepMaterial[]
  reused?: StepMaterial[]
  heat: Heat
  durationSeconds?: number
  tool: string
  scene: 'pantry' | 'cut' | 'whisk' | 'oil' | 'egg' | 'tomato' | 'combine' | 'plate'
}

export const ingredients: Ingredient[] = [
  { id: 'tomato', name: '番茄', amount: 2, unit: '个', display: '2 个 · 约 300 g', emoji: '🍅' },
  { id: 'egg', name: '鸡蛋', amount: 3, unit: '个', display: '3 个', emoji: '🥚' },
  { id: 'oil', name: '食用油', amount: 15, unit: 'mL', display: '15 mL · 约 1 汤匙', emoji: '🫒' },
  { id: 'salt', name: '盐', amount: 2, unit: 'g', display: '2 g · 约 1/3 茶匙', emoji: '🧂' },
  { id: 'sugar', name: '白糖', amount: 3, unit: 'g', display: '3 g · 约 3/4 茶匙', emoji: '🍚', optional: true },
]

export const stages: { id: Stage; label: string; short: string; icon: string; note: string }[] = [
  { id: 'ingredients', label: '食材和调料', short: '食材', icon: '01', note: '把每样东西摆在手边' },
  { id: 'prep', label: '备菜', short: '备菜', icon: '02', note: '洗切番茄，打散鸡蛋' },
  { id: 'cook', label: '烹饪', short: '烹饪', icon: '03', note: '按火候与状态依次下锅' },
  { id: 'finished', label: '成品展示', short: '成品', icon: '04', note: '装盘，记录你的作品' },
]

export const steps: RecipeStep[] = [
  {
    id: 1, stage: 'ingredients', title: '核对食材与调料', verb: '备齐', scene: 'pantry',
    description: '把番茄、鸡蛋、食用油、盐和可选白糖摆在手边，准备砧板、刀、碗、筷子、锅和锅铲。',
    cue: '食材、调料和厨具都已备齐。', preview: '下一步：洗切番茄', heat: '未开火', tool: '砧板 · 刀 · 碗 · 锅',
    additions: [],
  },
  {
    id: 2, stage: 'prep', title: '洗切番茄', verb: '切块', scene: 'cut',
    description: '洗净番茄，去蒂后切成大小接近的小块；切出的汁水也留在碗里。',
    cue: '番茄块大小接近，汁水没有倒掉。', preview: '下一步：打散鸡蛋', heat: '未开火', tool: '砧板 · 刀 · 碗',
    handled: [{ id: 'tomato', amount: 2, display: '2 个 · 约 300 g' }], additions: [],
  },
  {
    id: 3, stage: 'prep', title: '打散鸡蛋', verb: '搅匀', scene: 'whisk',
    description: '鸡蛋打入碗中，用筷子搅拌到蛋黄和蛋白均匀混合。',
    cue: '蛋液颜色均匀，没有明显蛋白块。', preview: '下一步：热锅加油', heat: '未开火', tool: '碗 · 筷子',
    handled: [{ id: 'egg', amount: 3, display: '3 个' }], additions: [],
  },
  {
    id: 4, stage: 'cook', title: '热锅加油', verb: '热锅', scene: 'oil',
    description: '锅开中火预热，倒入第一份食用油，轻轻晃锅让锅底铺上一层油。',
    cue: '油铺开，表面有轻微流动感；不要等到冒烟。', preview: '下一步：炒鸡蛋', heat: '中火', durationSeconds: 30, tool: '炒锅 · 锅铲',
    additions: [{ id: 'oil', amount: 10, display: '10 mL · 约 2 茶匙' }],
  },
  {
    id: 5, stage: 'cook', title: '炒鸡蛋', verb: '轻推', scene: 'egg',
    description: '倒入蛋液。边缘开始凝固时，用锅铲从外向内轻轻推动，形成柔软的大块，先盛出。',
    cue: '蛋液基本凝固，仍有柔软感即可盛出。', preview: '下一步：炒番茄', heat: '中火', durationSeconds: 40, tool: '炒锅 · 锅铲 · 碗',
    additions: [{ id: 'egg', amount: 3, display: '3 个 · 已打散' }],
  },
  {
    id: 6, stage: 'cook', title: '炒番茄', verb: '炒软', scene: 'tomato',
    description: '锅中倒入剩余食用油，加入番茄及碗里的汁水。中火翻炒，直到番茄变软、锅底有汁。',
    cue: '番茄边缘变软，锅底出现红色汤汁。', preview: '下一步：回锅合炒调味', heat: '中火', durationSeconds: 90, tool: '炒锅 · 锅铲',
    additions: [{ id: 'oil', amount: 5, display: '5 mL · 约 1 茶匙' }, { id: 'tomato', amount: 2, display: '2 个 · 约 300 g' }],
  },
  {
    id: 7, stage: 'cook', title: '回锅合炒调味', verb: '合炒', scene: 'combine',
    description: '把炒好的鸡蛋倒回锅中，加入盐。喜欢稍甜口味可加入白糖，轻轻翻匀。',
    cue: '鸡蛋和番茄拌匀，尝一口后按个人口味调整。', preview: '下一步：关火装盘', heat: '小火', durationSeconds: 30, tool: '炒锅 · 锅铲 · 量勺',
    additions: [{ id: 'salt', amount: 2, display: '2 g · 约 1/3 茶匙' }, { id: 'sugar', amount: 3, display: '3 g · 约 3/4 茶匙（可选）' }],
    reused: [{ id: 'egg', amount: 3, display: '3 个 · 已炒好，回锅' }],
  },
  {
    id: 8, stage: 'finished', title: '关火装盘', verb: '盛出', scene: 'plate',
    description: '关火后把番茄炒蛋盛入盘中。先看看成品，再按需拍照记录。',
    cue: '鸡蛋柔软，番茄有汁，菜已安全盛入盘中。', preview: '完成啦，享用你的番茄炒蛋。', heat: '未开火', tool: '盘子 · 锅铲',
    additions: [],
  },
]

export const ingredientById = Object.fromEntries(ingredients.map(item => [item.id, item])) as Record<IngredientId, Ingredient>

export function checkQuantities(): string[] {
  return ingredients.flatMap(item => {
    const used = steps.flatMap(step => step.additions).filter(part => part.id === item.id).reduce((sum, part) => sum + part.amount, 0)
    return used === item.amount ? [] : [`${item.name}: 清单 ${item.amount}${item.unit}，步骤合计 ${used}${item.unit}`]
  })
}
