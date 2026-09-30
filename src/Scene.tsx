import type { RecipeStep } from './recipe'
import ingredientsArt from './assets/ingredients-watercolor.webp'
import cuttingArt from './assets/cut-tomato-watercolor.webp'
import whiskArt from './assets/whisk-eggs-watercolor.webp'
import oilArt from './assets/oil-pan-watercolor.webp'
import scrambledArt from './assets/scrambled-eggs-watercolor.webp'
import tomatoesArt from './assets/tomatoes-pan-watercolor.webp'
import combinedArt from './assets/combine-pan-watercolor.webp'
import finishedArt from './assets/tomato-egg-hero.webp'

const art: Record<RecipeStep['scene'], string> = {
  pantry: ingredientsArt,
  cut: cuttingArt,
  whisk: whiskArt,
  oil: oilArt,
  egg: scrambledArt,
  tomato: tomatoesArt,
  combine: combinedArt,
  plate: finishedArt,
}

/** Storyboards stay static; the cooking countdown is independent. */
export function Scene({ step, compact = false }: { step: RecipeStep; compact?: boolean }) {
  return <figure className={`scene-wrap scene-${step.scene}${compact ? ' scene-compact' : ''}`} aria-label={`${step.title}静态手绘示意`}>
    <img className="scene-art" src={art[step.scene]} alt={`${step.title}：${step.description}`} draggable={false}/>
  </figure>
}
