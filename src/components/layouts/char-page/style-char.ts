export const styles = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@300;400;600&display=swap');

.app {
  --bg-0: #0a0604;
  --bg-1: #14100a;
  --bg-2: #1f1810;
  --line: #3a2c1c;
  --line-bright: #5a4630;
  --text: #e8d9b5;
  --muted: #8a7858;
  --ember: #ff8a3c;
  --gold: #d4a857;
  background: var(--bg-0);
  color: var(--text);
  font-family: 'Cormorant Garamond', serif;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}
.app::before {
  content: ""; position: fixed; inset: 0;
  background:
    radial-gradient(ellipse at 20% 20%, rgba(255,138,60,0.06), transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(74,111,168,0.04), transparent 50%);
  pointer-events: none; z-index: 0;
}
.app::after {
  content: ""; position: fixed; inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/></svg>");
  pointer-events: none; z-index: 1; mix-blend-mode: overlay;
}
.header {
  position: relative; z-index: 5;
  padding: 24px 36px 18px;
  border-bottom: 1px solid var(--line);
  display: flex; justify-content: space-between;
  align-items: center; flex-wrap: wrap; gap: 16px;
  background: linear-gradient(180deg, rgba(255,138,60,0.04), transparent);
}
.brand { display: flex; align-items: center; gap: 16px; }
.sigil {
  width: 44px; height: 44px;
  display: grid; place-items: center;
  color: var(--gold);
  border: 1px solid var(--line-bright);
  background: radial-gradient(circle, rgba(255,138,60,0.15), transparent);
  position: relative;
}
.sigil::before, .sigil::after {
  content: ""; position: absolute;
  width: 8px; height: 8px; border: 1px solid var(--gold);
}
.sigil::before { top: -4px; left: -4px; border-right: none; border-bottom: none; }
.sigil::after  { bottom: -4px; right: -4px; border-left: none; border-top: none; }
.brand h1 {
  font-family: 'Cinzel', serif;
  font-size: 24px; font-weight: 900; letter-spacing: 0.18em;
  text-shadow: 0 0 20px rgba(255,138,60,0.2);
}
.brand h1 .accent { color: var(--ember); }
.brand small {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; letter-spacing: 0.3em; color: var(--muted); margin-top: 2px;
}
.status {
  display: flex; align-items: center; gap: 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 0.2em; color: var(--muted); text-transform: uppercase;
}
.status-divider { color: var(--gold); }
.ember {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--ember); box-shadow: 0 0 10px var(--ember);
  animation: ember 1.4s ease-in-out infinite;
}
@keyframes ember {
  0%, 100% { opacity: 1; box-shadow: 0 0 10px var(--ember); }
  50%       { opacity: 0.5; box-shadow: 0 0 4px var(--ember); }
}
.hero-line {
  position: relative; z-index: 5;
  padding: 12px 36px; border-bottom: 1px solid var(--line);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px; letter-spacing: 0.25em; color: var(--muted);
  display: flex; gap: 28px; flex-wrap: wrap; background: var(--bg-1);
}
.hero-line b { color: var(--text); font-weight: 600; }
.layout {
  position: relative; z-index: 5;
  display: grid; grid-template-columns: 280px 1fr 400px;
  min-height: calc(100vh - 97px);
}
.sidebar {
  border-right: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(255,138,60,0.02), transparent);
  display: flex; flex-direction: column;
}
.sidebar-head { padding: 24px 24px 16px; border-bottom: 1px solid var(--line); }
.sidebar h2 {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; letter-spacing: 0.3em; color: var(--muted);
  margin-bottom: 6px; text-transform: uppercase;
}
.sidebar-sub {
  font-family: 'Cormorant Garamond', serif;
  font-size: 12px; font-style: italic; color: var(--muted); line-height: 1.4;
}
.char-list { list-style: none; margin: 0; padding: 0; flex: 1; }
.char-item {
  padding: 16px 24px; border-left: 2px solid transparent;
  cursor: pointer; transition: all 0.25s ease;
  display: flex; align-items: center; gap: 14px;
  position: relative; border-bottom: 1px solid rgba(58,44,28,0.4);
}
.char-item:hover { background: rgba(255,138,60,0.04); border-left-color: var(--muted); }
.char-item.active {
  background: linear-gradient(90deg, rgba(255,138,60,0.1), transparent);
  border-left-color: var(--ember);
}
.char-item.active::after {
  content: "◆"; position: absolute; right: 18px;
  color: var(--ember); font-size: 10px;
}
.char-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; color: var(--muted); width: 36px; letter-spacing: 0.1em;
}
.char-meta { flex: 1; }
.char-name { font-family: 'Cinzel', serif; font-weight: 700; font-size: 16px; letter-spacing: 0.06em; }
.char-role {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; color: var(--muted); letter-spacing: 0.18em;
  text-transform: uppercase; margin-top: 3px;
}
.sidebar-foot {
  padding: 20px 24px; border-top: 1px solid var(--line);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; color: var(--muted); letter-spacing: 0.25em; text-align: center;
}
.stage {
  position: relative; border-right: 1px solid var(--line); overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 30%, rgba(255,138,60,0.12), transparent 60%),
    radial-gradient(ellipse at 50% 100%, rgba(212,168,87,0.05), transparent 70%),
    var(--bg-0);
}
.stage-canvas { width: 100%; height: 100%; position: absolute; inset: 0; }
.stage-canvas canvas { display: block; width: 100% !important; height: 100% !important; }
.vignette {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(10,6,4,0.7) 100%);
  z-index: 2;
}
.overlay { position: absolute; pointer-events: none; z-index: 3; }
.corner-tl { top: 18px; left: 18px; }
.corner-tr { top: 18px; right: 18px; text-align: right; }
.corner-bl { bottom: 18px; left: 18px; }
.corner-br { bottom: 18px; right: 18px; text-align: right; }
.ov-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; color: var(--muted); letter-spacing: 0.3em; text-transform: uppercase;
}
.ov-value {
  font-family: 'Cinzel', serif; font-size: 14px; color: var(--gold);
  letter-spacing: 0.12em; margin-top: 2px;
  text-shadow: 0 0 8px rgba(212,168,87,0.4);
}
.name-display {
  position: absolute; bottom: 60px; left: 0; right: 0;
  text-align: center; z-index: 3; pointer-events: none;
}
.name-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; letter-spacing: 0.5em; color: var(--gold); margin-bottom: 8px;
}
.name-text {
  font-family: 'Cinzel', serif; font-weight: 900; font-size: 42px;
  letter-spacing: 0.12em; text-transform: uppercase;
  background: linear-gradient(180deg, var(--text) 0%, var(--gold) 50%, rgba(212,168,87,0.3) 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.name-title {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic; font-size: 16px; color: var(--muted); margin-top: 6px;
}
.panel {
  padding: 24px 24px 40px; overflow-y: auto;
  max-height: calc(100vh - 110px);
  background: linear-gradient(180deg, var(--bg-1), var(--bg-0));
}
.panel::-webkit-scrollbar { width: 6px; }
.panel::-webkit-scrollbar-track { background: var(--bg-1); }
.panel::-webkit-scrollbar-thumb { background: var(--line-bright); }
.panel-section { margin-bottom: 24px; }
.panel-section h3 {
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
  letter-spacing: 0.3em; color: var(--gold); text-transform: uppercase;
  margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--line);
  display: flex; align-items: center; gap: 10px;
}
.panel-section h3::before { content: "❖"; color: var(--ember); font-size: 10px; }
.description {
  font-size: 14px; line-height: 1.65; color: var(--text);
  font-style: italic; font-family: 'Cormorant Garamond', serif;
}
.loadout { border: 1px solid var(--line); margin-bottom: 16px; background: rgba(255,138,60,0.03); }
.loadout-row {
  display: flex; justify-content: space-between;
  padding: 10px 14px; border-bottom: 1px solid var(--line); font-size: 12px;
}
.loadout-row:last-child { border-bottom: none; }
.loadout-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; color: var(--muted); letter-spacing: 0.18em; text-transform: uppercase;
}
.loadout-value {
  font-family: 'Cinzel', serif; color: var(--text);
  font-weight: 600; font-size: 12px; letter-spacing: 0.05em;
}
.power-card {
  border: 1px solid var(--line-bright); padding: 14px 16px; margin-bottom: 24px;
  display: flex; justify-content: space-between; align-items: center;
  background: linear-gradient(135deg, rgba(255,138,60,0.06), transparent); position: relative;
}
.power-card::before, .power-card::after {
  content: ""; position: absolute; width: 12px; height: 12px; border: 1px solid var(--ember);
}
.power-card::before { top: -1px; left: -1px; border-right: none; border-bottom: none; }
.power-card::after  { bottom: -1px; right: -1px; border-left: none; border-top: none; }
.power-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; letter-spacing: 0.25em; color: var(--muted); text-transform: uppercase;
}
.power-sub {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic; font-size: 11px; color: var(--muted); margin-top: 2px;
}
.power-value {
  font-family: 'Cinzel', serif; font-weight: 900; font-size: 32px;
  color: var(--ember); text-shadow: 0 0 15px rgba(255,138,60,0.5);
}
.stats { display: grid; gap: 10px; }
.stat-row {
  display: grid; grid-template-columns: 100px 1fr 36px;
  align-items: center; gap: 12px; padding: 4px 0;
}
.stat-row.primary {
  background: rgba(255,138,60,0.05); margin: 0 -8px;
  padding: 4px 8px; border-left: 2px solid var(--ember);
}
.stat-code { font-family: 'Cinzel', serif; font-weight: 700; font-size: 13px; letter-spacing: 0.1em; }
.primary-mark { color: var(--ember); margin-left: 4px; font-size: 10px; }
.stat-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; color: var(--muted); letter-spacing: 0.18em;
  text-transform: uppercase; margin-top: 1px;
}
.stat-bar { height: 12px; background: var(--bg-2); border: 1px solid var(--line); overflow: hidden; }
.stat-fill {
  height: 100%; background: linear-gradient(90deg, var(--ember), var(--gold));
  transition: width 0.7s cubic-bezier(.2,.9,.3,1);
}
.stat-value { font-family: 'Cinzel', serif; font-weight: 700; font-size: 15px; text-align: right; }
.skill-card {
  border: 1px solid var(--line); padding: 12px 14px; margin-bottom: 8px;
  background: linear-gradient(135deg, rgba(212,168,87,0.04), transparent); position: relative;
}
.skill-card::before {
  content: ""; position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px; background: linear-gradient(180deg, var(--ember), transparent);
}
.skill-name {
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 13px;
  color: var(--gold); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 5px;
}
.skill-desc {
  font-family: 'Cormorant Garamond', serif;
  font-size: 13px; color: var(--text); line-height: 1.55; font-style: italic;
}
.dice-list { list-style: none; padding: 0; margin: 0; }
.dice-list li {
  padding: 7px 0; border-bottom: 1px dashed var(--line);
  display: flex; align-items: center; gap: 10px; font-size: 12.5px;
}
.dice-check { font-family: 'Cormorant Garamond', serif; font-style: italic; flex: 1; }
.dice-arrow { color: var(--gold); font-size: 14px; }
.dice-formula {
  font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: var(--ember);
  background: var(--bg-2); border: 1px solid var(--line); padding: 3px 8px; letter-spacing: 0.1em;
}
@media (max-width: 1100px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar, .stage { border-right: none; border-bottom: 1px solid var(--line); }
  .stage { height: 60vh; }
  .panel { max-height: none; }
}
`;
