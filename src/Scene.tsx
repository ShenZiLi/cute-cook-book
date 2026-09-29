import { useState } from 'react'
import type { RecipeStep } from './recipe'

interface SceneProps { step: RecipeStep; compact?: boolean; playing?: boolean; keySeed?: number; fit?: 'contain' | 'cover' }

const tomato = (x: number, y: number, size = 1, key = '') => <g key={key} transform={`translate(${x} ${y}) scale(${size})`} className="scene-bob"><path d="M-24 0C-26-17-13-26 0-24c18-4 28 9 24 25-4 19-16 25-26 23C-17 27-25 17-24 0Z" fill="#df6950" stroke="#8d4634" strokeWidth="2.6"/><path d="M-10-21 0-27l10 6-10 4Z" fill="#527d49"/><path d="M-8-12q-7 7-7 18" fill="none" stroke="#f8c2a3" strokeWidth="3" strokeLinecap="round"/></g>
const egg = (x: number, y: number, size = 1, key = '') => <g key={key} transform={`translate(${x} ${y}) scale(${size})`} className="scene-bob"><ellipse rx="32" ry="24" fill="#fff5dc" stroke="#aa8055" strokeWidth="2"/><circle cx="3" cy="0" r="13" fill="#edbc55" stroke="#d3993b" strokeWidth="2"/></g>

function Pan({ children, heat = false }: { children?: React.ReactNode; heat?: boolean }) {
  return <>
    <path d="M322 190 Q397 177 412 169 L425 177 Q400 194 323 202Z" fill="#a96e41" stroke="#513a2c" strokeWidth="4" />
    {heat && <g className="scene-flame"><path d="M120 289q-16-18 0-31-2 14 9 17 7-17 0-27 23 19 12 41Z" fill="#e89847"/><path d="M173 292q-13-17-2-31 1 9 8 13 6-15 1-24 22 22 10 42Z" fill="#e69843"/><path d="M231 292q-13-17-2-31 1 9 8 13 6-15 1-24 22 22 10 42Z" fill="#e69843"/><path d="M282 289q-15-19 0-31-1 11 8 17 6-14 0-25 21 21 10 39Z" fill="#e89847"/></g>}
    <path d="M59 173Q71 273 209 275Q340 273 351 173Z" fill="#433d36" stroke="#272b24" strokeWidth="5"/>
    <ellipse cx="205" cy="178" rx="148" ry="72" fill="#242a27" stroke="#685e4c" strokeWidth="6"/>
    <ellipse cx="205" cy="175" rx="131" ry="58" fill="#3d3e37" stroke="#a2916e" strokeWidth="1.5" strokeDasharray="6 9"/>
    {children}
  </>
}

function SceneArt({ scene }: { scene: RecipeStep['scene'] }) {
  if (scene === 'pantry') return <>
    <ellipse cx="202" cy="276" rx="166" ry="20" fill="#e4d9bd"/>
    <path d="M83 216q0-57 55-56h136q55 1 55 56v47H83Z" fill="#d9b68e" stroke="#876849" strokeWidth="4"/>
    {tomato(142,193,1.1,'a')}{tomato(194,188,1,'b')}{egg(260,204,.9,'c')}
    <path d="M305 194v60m-13-60h26l5 60h-36Z" fill="#e4b255" stroke="#9b6a3f" strokeWidth="3"/>
    <path d="M111 148q52-29 108-17" fill="none" stroke="#698456" strokeWidth="4" strokeLinecap="round"/>
  </>
  if (scene === 'cut') return <>
    <path d="M78 157q1-20 23-20h211q19 0 20 19v103q0 20-20 20H101q-23 0-23-20Z" fill="#d8a879" stroke="#8f623e" strokeWidth="5"/>
    <path d="M95 169h216M93 256h223" stroke="#f4d2a5" strokeWidth="2" opacity=".6"/>
    {tomato(147,209,1.2,'a')}{tomato(229,210,.85,'b')}{tomato(274,225,.67,'c')}
    <g className="scene-cut"><path d="M302 73 260 173 276 177 316 84Z" fill="#d8d8cf" stroke="#6e7068" strokeWidth="3"/><path d="M302 73 327 31l13 7-24 46Z" fill="#8c613f" stroke="#5f442e" strokeWidth="3"/></g>
    <path d="M225 128q-10 19-5 31" fill="none" stroke="#bc7048" strokeWidth="3" strokeLinecap="round"/>
  </>
  if (scene === 'whisk') return <>
    <ellipse cx="201" cy="267" rx="132" ry="27" fill="#e9d7ba"/>
    <path d="M71 154Q87 271 204 277q115-6 126-123Z" fill="#f5efdf" stroke="#9f8d6b" strokeWidth="5"/>
    <ellipse cx="201" cy="157" rx="131" ry="55" fill="#fffaf0" stroke="#aa9370" strokeWidth="5"/>
    <ellipse cx="201" cy="164" rx="106" ry="35" fill="#edbd5d"/>
    <path d="M151 165q42-29 97-4M168 183q40-13 75 0" fill="none" stroke="#f9d786" strokeWidth="6" strokeLinecap="round"/>
    <g className="scene-stir"><path d="M220 160 289 46" stroke="#906847" strokeWidth="11" strokeLinecap="round"/><path d="M202 150 270 46" stroke="#906847" strokeWidth="8" strokeLinecap="round"/></g>
  </>
  if (scene === 'oil') return <Pan heat><ellipse cx="202" cy="182" rx="78" ry="24" fill="#bf9c47" opacity=".75" className="scene-spread"/><path d="M260 80q-7 23-27 48" fill="none" stroke="#d8aa4e" strokeWidth="9" strokeLinecap="round" className="scene-pour"/><path d="M258 42h31l-5 41h-24Z" fill="#d6ad64" stroke="#9c7347" strokeWidth="3"/><path d="M263 43V27h23v16" fill="none" stroke="#9c7347" strokeWidth="4"/></Pan>
  if (scene === 'egg') return <Pan heat><g className="scene-stir"><path d="M142 157q22-40 53-7 34-36 52-2 37-7 35 25-22 6-35 22-29-5-48 8-34-3-45-21-27 3-25-19Z" fill="#f3cb6e" stroke="#dba643" strokeWidth="5"/><path d="M166 165q15-8 26 4m27 8q12-8 25-3" fill="none" stroke="#fff0b6" strokeWidth="6" strokeLinecap="round"/></g><g className="scene-spatula"><path d="M262 199 338 91" stroke="#9e6d42" strokeWidth="14" strokeLinecap="round"/><path d="M246 186q-5 23 13 28l19-8-6-24Z" fill="#ae7848"/></g></Pan>
  if (scene === 'tomato') return <Pan heat>{tomato(142,160,.8,'a')}{tomato(200,184,.83,'b')}{tomato(250,155,.78,'c')}<path d="M139 210q63 19 128-3" fill="none" stroke="#ba6045" strokeWidth="8" strokeLinecap="round" className="scene-stir"/></Pan>
  if (scene === 'combine') return <Pan heat>{tomato(128,161,.72,'a')}{tomato(265,170,.7,'b')}<g className="scene-stir"><path d="M147 187q23-25 52 0 18-24 47-2 9 24-20 26-20-4-42 11-27-7-37-35Z" fill="#f3cb6e" stroke="#dba643" strokeWidth="4"/></g><g className="scene-pour"><path d="M211 86q-10 27-8 54" fill="none" stroke="#e8e1ca" strokeWidth="4" strokeDasharray="5 8"/><path d="M200 68h26" stroke="#9d8a6e" strokeWidth="9" strokeLinecap="round"/></g></Pan>
  return <>
    <ellipse cx="204" cy="264" rx="156" ry="30" fill="#e4d4b6"/>
    <ellipse cx="204" cy="203" rx="151" ry="74" fill="#eee6d2" stroke="#a98a5f" strokeWidth="5"/>
    <ellipse cx="204" cy="198" rx="129" ry="57" fill="#f8f3e7" stroke="#d4bd94" strokeWidth="2"/>
    {tomato(147,190,.88,'a')}{tomato(242,211,.76,'b')}{tomato(239,173,.61,'c')}
    <path d="M149 207q18-30 47-5 29-31 48 2-25 29-55 18-25 18-40-15Z" fill="#f1c76d" stroke="#d6a048" strokeWidth="4"/>
    <path d="M171 176q28-24 67-6" fill="none" stroke="#6f8b55" strokeWidth="5" strokeLinecap="round"/>
    <path d="m59 80 9 11m55-53 6 13m195 17 14-8" stroke="#dfad63" strokeWidth="4" strokeLinecap="round"/>
  </>
}

export function Scene({ step, compact = false, playing = true, keySeed = 0, fit = 'contain' }: SceneProps) {
  return <div className={`scene-wrap ${playing ? '' : 'scene-paused'} ${compact ? 'scene-compact' : ''}`} aria-label={`${step.title}手绘示意`}>
    <svg key={`${step.id}-${keySeed}`} className="scene-svg" viewBox="0 0 420 320" preserveAspectRatio={fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'} role="img" aria-label={`${step.title}：${step.description}`}>
      <defs><pattern id="paperDots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="3" cy="6" r=".6" fill="#b99c72" opacity=".18" /></pattern></defs>
      <rect width="420" height="320" rx="25" fill="#f7efdc"/><rect width="420" height="320" rx="25" fill="url(#paperDots)"/>
      <path d="M19 252q48-17 66 10M344 244q42-11 60 6" fill="none" stroke="#94a77c" strokeWidth="2" strokeDasharray="4 7"/>
      <SceneArt scene={step.scene}/>
      <path d="M23 38q34-14 60-7M334 40q25 5 57-4" fill="none" stroke="#b79d72" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
    </svg>
    {!compact && <span className="scene-stamp">手绘动作示意 · {step.verb}</span>}
  </div>
}

export function AnimatedScene({ step, compact = false }: { step: RecipeStep; compact?: boolean }) {
  const [playing, setPlaying] = useState(true)
  const [keySeed, setKeySeed] = useState(0)
  return <div className="animated-scene">
    <Scene step={step} compact={compact} playing={playing} keySeed={keySeed}/>
    {!compact && <div className="scene-controls"><button type="button" onClick={() => setPlaying(value => !value)} aria-label={playing ? '暂停动作动画' : '继续动作动画'}>{playing ? 'Ⅱ 暂停动作' : '▷ 继续动作'}</button><button type="button" onClick={() => { setKeySeed(value => value + 1); setPlaying(true) }}>↻ 重看动作</button></div>}
  </div>
}
