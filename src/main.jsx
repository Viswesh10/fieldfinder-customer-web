import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import './experiment.css'

class SportiLandErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) {
    console.error('SportiLand render error:', error, info?.componentStack || '')
  }
  render() {
    if (this.state.error) {
      const message = this.state.error?.message || String(this.state.error)
      return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'28px',background:'#f6f6f0',color:'#11120f',fontFamily:'Arial,sans-serif'}}>
        <section style={{width:'min(680px,100%)',padding:'30px',border:'1px solid #d8ddcb',borderRadius:'20px',background:'#fff',boxShadow:'0 18px 55px #11120f14'}}>
          <div style={{display:'inline-flex',padding:'7px 11px',borderRadius:'30px',background:'#c7ff3e',fontWeight:800,fontSize:'11px'}}>SPORTILAND · STARTUP CHECK</div>
          <h1 style={{fontSize:'28px',margin:'18px 0 8px'}}>The page could not finish loading.</h1>
          <p style={{color:'#53564e',lineHeight:1.6}}>A frontend error stopped the customer website from rendering. The details below can help identify the issue.</p>
          <pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',padding:'14px',borderRadius:'10px',background:'#171914',color:'#d8ff83',fontSize:'12px'}}>{message}</pre>
          <button onClick={() => window.location.reload()} style={{border:0,borderRadius:'9px',padding:'12px 18px',background:'#c7ff3e',color:'#11120f',fontWeight:800,cursor:'pointer'}}>Reload SportiLand</button>
        </section>
      </main>
    }
    return this.props.children
  }
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('SportiLand root element #root was not found')
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode><SportiLandErrorBoundary><App /></SportiLandErrorBoundary></React.StrictMode>
)
window.__sportilandMounted = true
