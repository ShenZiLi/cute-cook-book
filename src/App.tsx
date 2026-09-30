import { Fragment, useEffect, useReducer, useRef, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { Scene } from './Scene'
import { deletePhoto, getPhoto, savePhoto } from './photo'
import { ingredientById, ingredients, stages, steps, type Stage, type StepMaterial } from './recipe'
import { loadProgress, progressReducer, remainingSeconds, saveProgress } from './progress'
import ingredientsArt from './assets/ingredients-watercolor.webp'
import cuttingArt from './assets/cut-tomato-watercolor.webp'
import whiskArt from './assets/whisk-eggs-watercolor.webp'
import combinedArt from './assets/combine-pan-watercolor.webp'
import finishedArt from './assets/tomato-egg-hero.webp'
import './styles.css'

const demoIds = [2, 3, 4, 5, 6, 7, 8]
const routeArt = [ingredientsArt, cuttingArt, combinedArt, finishedArt]

function clock(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

function MaterialGroup({ label, items }: { label: string; items: StepMaterial[] }) {
  if (!items.length) return null
  return <div className="material-group">
    <span className="material-label">{label}</span>
    {items.map(item => <div className="material-row" key={item.id}>
      <span>{ingredientById[item.id].name}</span><strong>{item.display}</strong>
    </div>)}
  </div>
}

function Home() {
  return <main className="page home-page">
    <div className="home-layout">
      <header className="home-header"><span className="tiny-tomato" aria-hidden="true">●</span><h1>今天做什么</h1><span className="leaf-mark" aria-hidden="true">❧</span></header>
      <div className="home-hero">
        <span className="home-aside left">简单<br/>好吃<br/>又下饭！</span>
        <Scene step={steps[7]} compact/>
        <span className="home-aside right">家常味<br/>从这一道开始</span>
      </div>
      <section className="home-identity"><h2>番茄炒蛋</h2><div className="brush-line" aria-hidden="true"/><p><span>♧ &nbsp;2 人份</span><i aria-hidden="true"/><span>◷ &nbsp;约 15 分钟</span></p></section>
      <nav className="home-route" aria-label="做菜流程">{stages.map((stage, index) => <Fragment key={stage.id}><div className="route-item"><span className="route-image"><img src={routeArt[index]} alt=""/></span><strong>{stage.label}</strong></div>{index < stages.length - 1 && <span className="route-arrow" aria-hidden="true">→</span>}</Fragment>)}</nav>
      <Link className="primary-button home-cta" to="/recipe">查看菜谱 <span aria-hidden="true">→</span></Link>
      <p className="calibration-note">用量与时间是参考值，正式指导前仍需试做校准。</p>
    </div>
  </main>
}

function ManualStoryboard({ onFollow }: { onFollow: () => void }) {
  const [index, setIndex] = useState(3)
  const step = steps[demoIds[index] - 1]
  return <section className="demo-section">
    <header className="demo-header"><h2>完整演示</h2><p>先看一遍，再动手做</p></header>
    <div className="storyboard">
      <div className="storyboard-label"><span>{String(step.id).padStart(2, '0')} / 08</span><strong>{step.title}</strong></div>
      <Scene step={step}/>
      <span className="storyboard-note">{step.verb} ↗</span>
    </div>
    <div className="storyboard-rail" role="group" aria-label="手动查看完整演示分镜">
      {demoIds.map((id, n) => <button key={id} type="button" className={n === index ? 'active' : ''} aria-pressed={n === index} aria-label={`第 ${n + 1} 段：${steps[id - 1].title}`} onClick={() => setIndex(n)}><span/>{steps[id - 1].title}</button>)}
    </div>
    <div className="storyboard-controls"><button type="button" disabled={index === 0} onClick={() => setIndex(value => value - 1)}>← 上一段</button><span>手动分镜 · {index + 1} / {demoIds.length}</span><button type="button" disabled={index === demoIds.length - 1} onClick={() => setIndex(value => value + 1)}>下一段 →</button></div>
    <p className="demo-hint">这是静态分镜预览。查看分镜不会改变跟做进度或启动倒计时。</p>
    <button className="text-button" type="button" onClick={onFollow}>返回当前跟做步骤 →</button>
  </section>
}

function PhotoSection() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const photoRef = useRef<string | null>(null)
  const cameraInput = useRef<HTMLInputElement>(null)
  const libraryInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    let alive = true
    getPhoto().then(blob => { if (alive && blob) { const url = URL.createObjectURL(blob); photoRef.current = url; setPhotoUrl(url) } }).catch(() => { if (alive) setMessage('无法读取本机照片，请检查浏览器存储权限。') })
    return () => { alive = false; if (photoRef.current) URL.revokeObjectURL(photoRef.current) }
  }, [])
  async function handleFile(file?: File) {
    if (!file) return
    if (!file.type.startsWith('image/')) { setMessage('请选择图片文件。'); return }
    if (file.size > 15 * 1024 * 1024) { setMessage('照片超过 15 MB，请选一张更小的图片。'); return }
    setBusy(true); setMessage('')
    try {
      await savePhoto(file)
      const url = URL.createObjectURL(file)
      if (photoRef.current) URL.revokeObjectURL(photoRef.current)
      photoRef.current = url; setPhotoUrl(url); setMessage('照片已保存在本机浏览器。')
    } catch { setMessage('照片保存失败。请检查浏览器可用空间，再试一次。') }
    finally { setBusy(false) }
  }
  async function remove() {
    setBusy(true)
    try {
      await deletePhoto()
      if (photoRef.current) URL.revokeObjectURL(photoRef.current)
      photoRef.current = null; setPhotoUrl(null); setMessage('照片已从本机删除。')
    } catch { setMessage('删除失败，请稍后重试。') }
    finally { setBusy(false) }
  }
  return <section className="photo-section" aria-label="我的料理记录">
    <div className="photo-heading"><strong>我的料理记录</strong><span>拍一张吧 ↘</span></div>
    <div className="photo-frame">
      {photoUrl ? <img src={photoUrl} alt="你保存的番茄炒蛋成品照片"/> : <div className="empty-photo"><span aria-hidden="true">▣</span><strong>记录我的成品</strong></div>}
      <div className="photo-actions"><button disabled={busy} onClick={() => cameraInput.current?.click()}>◎ {photoUrl ? '重新拍照' : '拍照'}</button><button disabled={busy} onClick={() => libraryInput.current?.click()}>▧ {photoUrl ? '更换照片' : '从相册选择'}</button></div>
      <small>♙ 照片只保存在本机</small>
    </div>
    {photoUrl && <button className="delete-link" disabled={busy} onClick={remove}>删除本机照片</button>}
    <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden onChange={event => { void handleFile(event.target.files?.[0]); event.target.value = '' }}/>
    <input ref={libraryInput} type="file" accept="image/*" hidden onChange={event => { void handleFile(event.target.files?.[0]); event.target.value = '' }}/>
    {message && <p className="status-message" role="status">{message}</p>}
    <p className="privacy-note">清除浏览器数据可能删除照片与跟做进度；照片不会上传。</p>
  </section>
}

function RecipePage() {
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(progressReducer, undefined, loadProgress)
  const [now, setNow] = useState(0)
  const [storageError, setStorageError] = useState(false)
  const [view, setView] = useState<'follow' | 'demo'>(() => state.activeStepId >= 4 || state.timer ? 'follow' : 'demo')
  useEffect(() => { setStorageError(!saveProgress(state)) }, [state])
  useEffect(() => {
    const update = () => setNow(Date.now())
    update()
    const interval = window.setInterval(update, 500)
    document.addEventListener('visibilitychange', update)
    window.addEventListener('focus', update)
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', update); window.removeEventListener('focus', update) }
  }, [])

  const step = steps[state.inspectedStepId - 1]
  const stageSteps = steps.filter(item => item.stage === state.stage)
  const inspecting = state.inspectedStepId !== state.activeStepId
  const timerLoading = state.timer?.stepId === step.id && now === 0
  const remaining = state.timer?.stepId === step.id && now ? remainingSeconds(state.timer, now) : null
  const isDemo = state.stage === 'cook' && view === 'demo'

  function selectStage(stage: Stage) {
    dispatch({ type: 'stage', stage })
    const target = steps.find(item => item.id === state.activeStepId && item.stage === stage) ?? steps.find(item => item.stage === stage)
    if (target) dispatch({ type: 'inspect', stepId: target.id })
  }

  function advance() {
    if (isDemo) { setView('follow'); dispatch({ type: 'return-active' }); return }
    if (state.stage === 'ingredients') {
      if (state.activeStepId === 1) dispatch({ type: 'complete', now: Date.now() })
      else selectStage('prep')
      return
    }
    dispatch(inspecting ? { type: 'return-active' } : { type: 'complete', now: Date.now() })
  }

  const actionLabel = isDemo ? '开始跟做' : state.stage === 'ingredients' ? '开始备菜' : inspecting ? '返回跟做步骤' : step.id === 8 ? '完成这道菜' : '完成本步，下一步'

  return <main className="page recipe-page">
    <header className="recipe-header"><button className="back-button" onClick={() => navigate('/')} aria-label="返回首页">←</button><h1>番茄炒蛋</h1><span className="header-sprig" aria-hidden="true">❧</span></header>
    <nav className="stage-nav" aria-label="菜谱阶段">{stages.map(stage => <button key={stage.id} className={state.stage === stage.id ? 'active' : ''} onClick={() => selectStage(stage.id)} aria-current={state.stage === stage.id ? 'step' : undefined}>{stage.short}</button>)}</nav>
    {storageError && <p className="error-banner" role="alert">跟做进度未能保存到本机，请检查浏览器存储权限。</p>}
    <div className={`stage-body stage-${state.stage}${isDemo ? ' stage-demo' : ''}`}>
      {state.stage === 'ingredients' && <section className="ingredients-section">
        <header className="content-heading"><h2>食材和调料</h2><p>两人份 · 下锅前备齐</p><span className="scribble">新鲜的食材<br/>是好味道的开始 ↘</span></header>
        <div className="ingredient-illustration"><Scene step={steps[0]} compact/></div>
        <div className="ingredients-scroll" tabIndex={0} aria-label="食材和调料清单，可上下滚动">
          <h3 className="brush-subtitle">食材</h3>
          {ingredients.filter(item => item.id === 'tomato' || item.id === 'egg').map(item => <div className="ingredient-row" key={item.id}><span className="ingredient-emoji" aria-hidden="true">{item.emoji}</span><strong>{item.name}</strong><span>{item.display}</span><span className="ingredient-check" aria-hidden="true">✓</span></div>)}
          <h3 className="brush-subtitle seasoning-title">调料</h3>
          {ingredients.filter(item => item.id !== 'tomato' && item.id !== 'egg').map(item => <div className="ingredient-row" key={item.id}><span className="ingredient-emoji" aria-hidden="true">{item.emoji}</span><strong>{item.name}</strong><span>{item.display}{item.optional && <small>可选</small>}</span></div>)}
          <p className="calibration-note">用量和时间为参考样例，实际使用前须试做校准。</p>
        </div>
      </section>}

      {isDemo && <ManualStoryboard onFollow={() => { setView('follow'); dispatch({ type: 'return-active' }) }}/ >}

      {!isDemo && state.stage !== 'ingredients' && <section className={`follow-section follow-${state.stage}`}>
        {state.stage === 'prep' && <header className="phase-heading"><h2>备菜</h2><p>下锅前，先把动作做完</p></header>}
        {state.stage === 'finished' && <header className="phase-heading finished-heading"><h2>完成啦！</h2><p>看看你的第一盘番茄炒蛋</p></header>}
        {state.stage !== 'finished' && <div className={`node-strip nodes-${state.stage}`} role="group" aria-label="点击查看步骤">{stageSteps.map((item, index) => <Fragment key={item.id}>{index > 0 && <span className="node-sep" aria-hidden="true">{state.stage === 'prep' ? '›' : ''}</span>}<button className={`${item.id === step.id ? 'current' : ''} ${state.completedIds.includes(item.id) ? 'done' : ''}`} onClick={() => dispatch({ type: 'inspect', stepId: item.id })} aria-pressed={item.id === step.id}><span className="node-dot">{state.completedIds.includes(item.id) ? '✓' : String(item.id).padStart(2,'0')}</span><span className="node-label">{item.title}</span></button></Fragment>)}</div>}
        {state.stage === 'cook' && <div className="cook-title"><div><h2>{step.title}</h2><p>{step.description}</p></div><button type="button" onClick={() => setView('demo')}>▷ 完整演示</button></div>}
        {inspecting && <div className="inspect-banner"><span>仅查看第 {step.id} 步，进度未改变。</span><button onClick={() => dispatch({ type: 'return-active' })}>返回原步骤</button><button onClick={() => dispatch({ type: 'continue-from-inspected' })}>从这步继续</button></div>}
        <div className="step-illustration"><Scene step={step}/>{state.stage === 'prep' && <span className="scene-note">{step.id === 2 ? '先切瓣，再切小块 ↘' : '搅拌到颜色均匀 ↘'}</span>}</div>
        {state.stage === 'prep' && <div className="prep-detail"><h3 className="brush-subtitle">{step.id === 2 ? '番茄切成小块' : '鸡蛋打散搅匀'}</h3><p>{step.description}</p><div className="cue-card"><span>✓</span><strong>{step.cue}</strong></div>{step.id === 2 ? <button className="prep-next-card" type="button" onClick={() => dispatch({ type: 'inspect', stepId: 3 })}><img src={whiskArt} alt=""/><span><small>下一步</small><strong>打散鸡蛋</strong><em>点击查看 →</em></span></button> : <div className="next-preview">{step.preview} ›</div>}{step.id === 3 && <div className="timer-pref"><label><input type="checkbox" checked={state.autoTimer} onChange={event => dispatch({ type: 'auto-timer', enabled: event.target.checked })}/> 自动计时 {state.autoTimer ? '已开启' : '已关闭'}</label><small>下一步进入热锅时自动开始</small></div>}</div>}
        {state.stage === 'cook' && <div className="cook-detail-scroll" tabIndex={0} aria-label="本步用量、倒计时和完成标志，可上下滚动">
          <div className="cook-facts"><div><span aria-hidden="true">♨</span><small>火候</small><strong>{step.heat}</strong></div><div><span aria-hidden="true">◈</span><small>本次用量</small><strong>{step.additions[0]?.display ?? step.reused?.[0]?.display ?? '见下方'}</strong></div><div><span aria-hidden="true">◷</span><small>参考</small><strong>{step.durationSeconds ? clock(step.durationSeconds) : '按状态'}</strong></div></div>
          {(step.handled?.length || step.additions.length || step.reused?.length) ? <div className="materials-detail"><MaterialGroup label="本步处理" items={step.handled ?? []}/><MaterialGroup label="本步加入" items={step.additions}/><MaterialGroup label="回锅使用 · 已计入前一步" items={step.reused ?? []}/></div> : null}
          {step.durationSeconds && <div className="timer-card"><div className="timer-main"><div><strong className="timer-clock">{timerLoading ? '··:··' : remaining === null ? clock(step.durationSeconds) : clock(remaining)}</strong><small>{timerLoading ? '正在恢复计时…' : remaining === 0 ? '时间到了，请检查食材状态' : remaining === null ? '下锅后再开始计时' : '计时中 · 请留意食材状态'}</small></div><label className="toggle-label">自动计时<input type="checkbox" checked={state.autoTimer} onChange={event => dispatch({ type: 'auto-timer', enabled: event.target.checked })}/><span className="switch"/><small>{state.autoTimer ? '已开启' : '已关闭'}</small></label></div><div className="timer-actions">{remaining === null || remaining === 0 ? <button disabled={inspecting || timerLoading} onClick={() => dispatch({ type: 'start-timer', now: Date.now() })}>{remaining === 0 ? '重新计时' : '开始计时'}</button> : <button onClick={() => dispatch({ type: 'reset-timer' })}>停止计时</button>}{remaining === 0 && <button onClick={() => dispatch({ type: 'reset-timer' })}>清除提醒</button>}<small>离开网页后按真实时间继续，无后台提醒</small></div></div>}
          <div className="cue-card"><span>✓</span><strong>{step.cue}</strong></div><div className="next-preview">{step.preview}</div>
        </div>}
        {state.stage === 'finished' && <><div className="finished-reference"><span className="scribble">简单的食材<br/>也能做出幸福味道！</span><div className="cue-card"><span>✓</span><div><strong>参考成品</strong><p>鸡蛋柔软，番茄出汁，颜色鲜亮。</p></div></div></div><PhotoSection/></>}
      </section>}
    </div>
    <div className="action-bar"><button className="primary-button" onClick={advance}>{actionLabel} <span aria-hidden="true">→</span></button></div>
  </main>
}

export default function App() {
  return <Routes><Route path="/" element={<Home/>}/><Route path="/recipe" element={<RecipePage/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>
}
