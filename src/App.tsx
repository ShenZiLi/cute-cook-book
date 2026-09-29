import { useEffect, useReducer, useRef, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AnimatedScene, Scene } from './Scene'
import { deletePhoto, getPhoto, savePhoto } from './photo'
import { ingredientById, ingredients, stages, steps, type Stage, type StepMaterial } from './recipe'
import { loadProgress, progressReducer, remainingSeconds, saveProgress } from './progress'

const demoOrder = [2, 3, 4, 5, 6, 7, 8]
const demoSegmentSeconds = 5

function fmtClock(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

function IconArrow({ left = false }: { left?: boolean }) { return <span aria-hidden="true">{left ? '←' : '→'}</span> }

function MaterialGroup({ label, items }: { label: string; items: StepMaterial[] }) {
  if (!items.length) return null
  return <div className="material-group"><h5>{label}</h5>{items.map(item => <div className="addition-row" key={item.id}><span>{ingredientById[item.id].emoji} {ingredientById[item.id].name}</span><strong>{item.display}</strong></div>)}</div>
}

function Brand() { return <div className="brand"><span className="brand-mark">✳</span><span>小厨手账</span></div> }

function Home() {
  return <main className="page home-page">
    <header className="home-header"><Brand/><span className="header-note">把每一步，都做得心里有数</span></header>
    <section className="home-intro"><div className="eyebrow">今日手绘菜谱 · 01 / 01</div><h1>番茄炒蛋<span className="title-star">✳</span></h1><p>先看清全程，再安心下锅。<br/>每一步都有动作、用量与火候提醒。</p></section>
    <div className="hero-art"><Scene step={steps[7]} compact/><div className="hero-badge">酸甜软嫩<br/><b>两人份</b></div></div>
    <section className="home-meta" aria-label="菜谱信息"><span><b>02</b><small>人份</small></span><span><b>约 15</b><small>分钟 · 参考</small></span><span><b>08</b><small>个步骤</small></span></section>
    <section className="home-route"><div className="section-heading"><div><span className="eyebrow">THE LITTLE ROUTE</span><h2>从准备到开饭</h2></div><span className="hand-note">一眼看全程 ↘</span></div><div className="route-grid">{stages.map(stage => <div className="route-item" key={stage.id}><span className="route-number">{stage.icon}</span><div><strong>{stage.label}</strong><small>{stage.note}</small></div></div>)}</div></section>
    <Link className="primary-button home-cta" to="/recipe">打开这道菜 <IconArrow/></Link>
    <p className="footnote">用量与时间为原型参考，正式使用前仍需试做校准。</p>
  </main>
}

function Demo({ onFollow }: { onFollow: () => void }) {
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [seen, setSeen] = useState(false)
  const tickRef = useRef<number>(0)
  const length = demoOrder.length * demoSegmentSeconds
  useEffect(() => {
    if (!playing) return
    tickRef.current = Date.now()
    const interval = window.setInterval(() => {
      const now = Date.now()
      const delta = (now - tickRef.current) / 1000
      tickRef.current = now
      setElapsed(previous => {
        const next = Math.min(length, previous + delta)
        if (next >= length) { setPlaying(false); setSeen(true) }
        return next
      })
    }, 100)
    return () => window.clearInterval(interval)
  }, [playing, length])
  const index = Math.min(demoOrder.length - 1, Math.floor(elapsed / demoSegmentSeconds))
  const step = steps[demoOrder[index] - 1]
  return <section className="demo-section">
    <div className="section-heading"><div><span className="eyebrow">先看一遍 · 再跟着做</span><h2>完整演示</h2></div><span className="sketch-ring">约 35 秒</span></div>
    <p className="muted">这是一段浓缩分镜，帮助你纵观备菜、下锅到装盘的顺序。观看不会启动做菜计时。</p>
    <div className="demo-scene"><Scene step={step} playing={playing}/><div className="demo-caption"><span>{String(step.id).padStart(2, '0')} / 08</span><strong>{step.title}</strong><span>{step.verb}</span></div></div>
    <div className="demo-progress" aria-label={`演示进度 ${Math.round(elapsed / length * 100)}%`}><span style={{ width: `${elapsed / length * 100}%` }}/></div>
    <div className="demo-meta"><span>{fmtClock(Math.ceil(elapsed))} / {fmtClock(length)}</span><span>{index + 1} / {demoOrder.length} 个动作</span></div>
    <div className="demo-buttons"><button className="primary-button" onClick={() => { if (elapsed >= length) setElapsed(0); setPlaying(value => !value) }}>{playing ? 'Ⅱ 暂停演示' : elapsed >= length ? '↻ 重看演示' : elapsed > 0 ? '▷ 继续演示' : '▷ 播放完整演示'}</button><button className="text-button" onClick={onFollow}>{seen ? '开始跟着做' : '跳过，直接跟做'} <IconArrow/></button></div>
    <div className="demo-mini-steps">{demoOrder.map((id, i) => <button key={id} className={i === index ? 'selected' : ''} onClick={() => { setElapsed(i * demoSegmentSeconds); setPlaying(false) }} aria-label={`查看演示第 ${i + 1} 段：${steps[id - 1].title}`}>{id}</button>)}</div>
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
  return <section className="photo-section"><div className="section-heading"><div><span className="eyebrow">我的料理记录</span><h2>留下今天这一盘</h2></div><span className="hand-note">拍一张吧 ↘</span></div>
    <div className="photo-frame">{photoUrl ? <img src={photoUrl} alt="你保存的番茄炒蛋成品照片"/> : <div className="empty-photo"><span>✧</span><strong>你的作品，等一张照片</strong><small>拍照只是记录，不影响完成菜谱</small></div>}</div>
    <div className="photo-actions"><button disabled={busy} onClick={() => cameraInput.current?.click()}>◉ {photoUrl ? '重新拍照' : '拍照'}</button><button disabled={busy} onClick={() => libraryInput.current?.click()}>▧ {photoUrl ? '更换照片' : '从相册选择'}</button></div>
    {photoUrl && <button className="delete-link" disabled={busy} onClick={remove}>删除本机照片</button>}
    <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden onChange={event => { void handleFile(event.target.files?.[0]); event.target.value = '' }}/>
    <input ref={libraryInput} type="file" accept="image/*" hidden onChange={event => { void handleFile(event.target.files?.[0]); event.target.value = '' }}/>
    {message && <p className="status-message" role="status">{message}</p>}
    <p className="privacy-note">照片只保存在当前设备的浏览器，不会上传。清除浏览器数据可能删除照片与跟做进度。</p>
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
    const interval = window.setInterval(update, 500)
    document.addEventListener('visibilitychange', update)
    window.addEventListener('focus', update)
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', update); window.removeEventListener('focus', update) }
  }, [])
  const step = steps[state.inspectedStepId - 1]
  const stageSteps = steps.filter(item => item.stage === state.stage)
  const timerLoading = state.timer?.stepId === step.id && now === 0
  const remaining = state.timer?.stepId === step.id && now ? remainingSeconds(state.timer, now) : null
  const isInspecting = state.inspectedStepId !== state.activeStepId
  function selectStage(stage: Stage) {
    dispatch({ type: 'stage', stage })
    const target = steps.find(item => item.id === state.activeStepId && item.stage === stage) ?? steps.find(item => item.stage === stage)
    if (target) dispatch({ type: 'inspect', stepId: target.id })
  }
  return <main className="page recipe-page">
    <header className="recipe-header"><button className="back-button" onClick={() => navigate('/')} aria-label="返回首页"><IconArrow left/></button><div><small>小厨手账 / 两人份</small><h1>番茄炒蛋</h1></div><span className="header-spark">✳</span></header>
    <nav className="stage-nav" aria-label="菜谱阶段">{stages.map(stage => <button key={stage.id} className={state.stage === stage.id ? 'active' : ''} onClick={() => selectStage(stage.id)} aria-current={state.stage === stage.id ? 'step' : undefined}><span>{stage.icon}</span>{stage.short}</button>)}</nav>
    {storageError && <p className="error-banner" role="alert">跟做进度未能保存到本机。请检查浏览器存储权限。</p>}
    {state.stage === 'ingredients' && <section className="ingredients-section"><div className="stage-kicker"><span>01 / 04</span><span>先摆好，再开火</span></div><h2 className="stage-title">食材和调料<span>✳</span></h2><p className="stage-lead">两人份。先核对总量，下方每一步会再告诉你这次要加多少。</p>
      <div className="ingredient-illustration"><AnimatedScene step={steps[0]}/></div>
      <div className="list-heading"><h3>主角食材</h3><span>FRESH & SIMPLE</span></div><div className="ingredient-list">{ingredients.filter(item => item.id === 'tomato' || item.id === 'egg').map(item => <div className="ingredient-row" key={item.id}><span className="ingredient-emoji">{item.emoji}</span><strong>{item.name}</strong><span>{item.display}</span></div>)}</div>
      <div className="list-heading"><h3>调味用量</h3><span>量勺约值并列</span></div><div className="ingredient-list">{ingredients.filter(item => item.id !== 'tomato' && item.id !== 'egg').map(item => <div className="ingredient-row" key={item.id}><span className="ingredient-emoji">{item.emoji}</span><strong>{item.name}{item.optional && <small>可选</small>}</strong><span>{item.display}</span></div>)}</div>
      <p className="ingredient-note">✎ 用量和时间为原型参考，正式作为烹饪指导前仍需试做校准。</p>
      <button className="primary-button wide" onClick={() => { if (state.activeStepId === 1) dispatch({ type: 'complete', now: Date.now() }); else selectStage('prep') }}>食材备齐，开始备菜 <IconArrow/></button>
    </section>}
    {state.stage !== 'ingredients' && (state.stage === 'cook' && view === 'demo' ? <Demo onFollow={() => { setView('follow'); dispatch({ type: 'return-active' }) }}/> : <>
      {state.stage === 'cook' && <div className="view-switch"><button className="selected" onClick={() => setView('follow')}>跟着做</button><button onClick={() => setView('demo')}>▷ 完整演示</button></div>}
      <section className="follow-section"><div className="stage-kicker"><span>{stages.find(item => item.id === state.stage)?.icon} / 04</span><span>{stages.find(item => item.id === state.stage)?.note}</span></div>
        <div className="section-heading"><div><span className="eyebrow">{state.stage === 'prep' ? '把食材处理好' : state.stage === 'cook' ? '跟着动作慢慢来' : '热乎乎地完成啦'}</span><h2>{stages.find(item => item.id === state.stage)?.label}</h2></div>{state.stage === 'finished' && <span className="hand-note">好香！</span>}</div>
        <div className="node-strip" role="group" aria-label="点击查看步骤">{stageSteps.map(item => <button key={item.id} className={`${item.id === step.id ? 'current' : ''} ${state.completedIds.includes(item.id) ? 'done' : ''}`} onClick={() => dispatch({ type: 'inspect', stepId: item.id })} aria-pressed={item.id === step.id}><span className="node-dot">{state.completedIds.includes(item.id) ? '✓' : String(item.id).padStart(2,'0')}</span><small>{item.title}</small></button>)}</div>
        {isInspecting && <div className="inspect-banner"><span>正在查看第 {step.id} 步，进度不变。</span><div><button onClick={() => dispatch({ type: 'return-active' })}>返回原步骤</button><button onClick={() => dispatch({ type: 'continue-from-inspected' })}>从这步继续</button></div></div>}
        <div className="step-heading"><span className="step-counter">STEP {String(step.id).padStart(2,'0')} / 08</span><h3>{step.title}</h3><p>{step.description}</p></div>
        <AnimatedScene key={step.id} step={step}/>
        <div className="step-facts"><div><span>🔥 火候</span><strong>{step.heat}</strong></div><div><span>◷ 参考时长</span><strong>{step.durationSeconds ? fmtClock(step.durationSeconds) : '按状态判断'}</strong></div><div><span>⌁ 工具</span><strong>{step.tool}</strong></div></div>
        <div className="detail-card"><h4>这一步的食材 <span>· 本次数量</span></h4><MaterialGroup label="本步处理" items={step.handled ?? []}/><MaterialGroup label="本步加入" items={step.additions}/><MaterialGroup label="回锅使用 · 已计入前一步" items={step.reused ?? []}/>{!step.handled?.length && !step.additions.length && !step.reused?.length && <p className="muted">这一步不再加入食材或调料。</p>}</div>
        {step.durationSeconds && <div className="timer-card"><div className="timer-heading"><div><span className="eyebrow">做菜倒计时</span><h4>{timerLoading ? '··:··' : remaining === null ? fmtClock(step.durationSeconds) : fmtClock(remaining)}</h4><small>{timerLoading ? '正在恢复计时…' : remaining === 0 ? '时间到了，请检查食材状态' : remaining === null ? '下锅后再开始计时' : '计时中 · 状态比时间更重要'}</small></div><label className="toggle-label">自动计时<input type="checkbox" checked={state.autoTimer} onChange={event => dispatch({ type: 'auto-timer', enabled: event.target.checked })}/><span className="switch"/><small>{state.autoTimer ? '已开启' : '已关闭'}</small></label></div><div className="timer-actions">{remaining === null || remaining === 0 ? <button disabled={isInspecting || timerLoading} onClick={() => dispatch({ type: 'start-timer', now: Date.now() })}>{remaining === 0 ? '↻ 重新计时' : '▷ 开始计时'}</button> : <button onClick={() => dispatch({ type: 'reset-timer' })}>停止计时</button>}{remaining === 0 && <button onClick={() => dispatch({ type: 'reset-timer' })}>清除提醒</button>}<span>离开页面后仍按真实时间计算；无后台提醒</span></div></div>}
        {((state.stage === 'prep' && step.id === 3) || (state.stage === 'cook' && !step.durationSeconds)) && <div className="timer-pref"><label><input type="checkbox" checked={state.autoTimer} onChange={event => dispatch({ type: 'auto-timer', enabled: event.target.checked })}/> 自动计时 {state.autoTimer ? '已开启' : '已关闭'}</label><small>进入需要计时的下一步时自动开始</small></div>}
        <div className="cue-card"><span className="cue-check">✓</span><div><strong>完成标志</strong><p>{step.cue}</p></div></div>
        <div className="next-preview">{step.preview}</div>
        <button className="primary-button wide" onClick={() => dispatch(isInspecting ? { type: 'return-active' } : { type: 'complete', now: Date.now() })}>{isInspecting ? '返回当前跟做步骤' : step.id === 8 ? '完成这道菜 ✓' : '完成本步，下一步'} <IconArrow/></button>
        {state.stage === 'finished' && <PhotoSection/>}
      </section>
    </>)}
    <footer className="recipe-footer">小厨手账 <span>·</span> 好好做饭，好好吃饭。</footer>
  </main>
}

export default function App() {
  return <Routes><Route path="/" element={<Home/>}/><Route path="/recipe" element={<RecipePage/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>
}
