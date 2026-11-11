import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IMAGE_CREDITS, NODE_SHARE, PLANS, PRICE_IN_PER_M_USD, PRICE_OUT_PER_M_USD, REFERRAL_SHARE } from '@whir/shared';
import { Footer } from '../components/Nav';
import { Blades, LogoMark } from '../components/Logo';
import { copyText } from '../components/CopyButton';
import { useNetworkStats, useSocketConnected } from '../lib/socket';
import { apiOrigin } from '../lib/api';
import { reducedMotion, useReveal, useScrollProgress } from '../lib/motion';
import { fmtInt } from '../lib/format';

export const PENDING_PROMPT_KEY = 'whir_pending_prompt';
const pct = (x: number) => Math.round(x * 100);
const NODE = pct(NODE_SHARE), REF = pct(REFERRAL_SHARE);

/** Headline whose lines rise out of a mask, one after another. */
function Lines({ lines, as: Tag = 'h2', className }: { lines: string[]; as?: 'h1' | 'h2'; className?: string }) {
  return (
    <Tag className={`lines${className ? ' ' + className : ''}`} data-reveal aria-label={lines.join(' ')}>
      {lines.map((l, i) => (
        <span className="ln" key={i} aria-hidden="true"><span style={{ transitionDelay: `${i * 90}ms` }}>{l}</span></span>
      ))}
    </Tag>
  );
}

/* ------------------------------------------------------------------ hero window */

const HAIKU = ['Fans hum through the night,', "a stranger's question answered,", 'my desk lamp still off.'];

/** The product, drawn in HTML: a chat being answered, and the node that answered it. */
function HeroWindow() {
  const ref = useRef<HTMLDivElement>(null);
  const win = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, (p) => {
    if (!win.current || reducedMotion()) return;
    const k = Math.min(1, p / 0.42);                  // flattens over the first part of the scroll
    const e = 1 - Math.pow(1 - k, 3);
    win.current.style.transform = `perspective(1800px) rotateX(${(1 - e) * 14}deg) scale(${0.94 + e * 0.06})`;
  });

  let at = 1.1;                                       // seconds: each line types after the previous one
  const lines = HAIKU.map((l) => { const d = l.length * 0.045; const o = { l, at, d, n: l.length }; at += d + 0.12; return o; });

  return (
    <div className="hero-stage" ref={ref}>
      <div className="hero-window" ref={win}>
        <aside className="hw-side">
          <div className="hw-dots"><i /><i /><i /></div>
          <div className="hw-it on">New chat</div>
          <div className="hw-it">Create</div>
          <div className="hw-it">API keys</div>
          <div className="hw-it">Earn</div>
        </aside>
        <div className="hw-main">
          <div className="hw-u">Write a haiku about a computer that never sleeps.</div>
          <div className="hw-a">
            <div className="hw-who"><LogoMark size={18} /> Whir Max</div>
            {lines.map((x) => (
              <p key={x.l}><span className="type" style={{ animationDelay: `${x.at}s`, animationDuration: `${x.d}s`, ['--n' as string]: x.n }}>{x.l}</span></p>
            ))}
          </div>
          <div className="hw-composer"><span>Message Whir…</span><i /></div>
        </div>
      </div>
      <div className="node-card" data-reveal>
        <div className="nc-t"><LogoMark size={30} spin />Your node</div>
        <div className="nc-s"><span className="led" />Running · serving the network</div>
        <div className="nc-k">You keep <b>{NODE}%</b> of what it serves.</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ how it works: the fan (signature) */

const STEPS = [
  { k: 'Run a node', h: 'Run a node.', p: 'Install the node on your Mac, PC or GPU box, next to Ollama or llama.cpp. Or open Earn in a browser that supports WebGPU.', status: 'Starting · checking speed' },
  { k: 'It serves AI', h: 'It serves AI.', p: 'Requests from chat, create and the API are routed to online nodes, and every token streams straight back.', status: 'Running · serving the network' },
  { k: `You keep ${NODE}%`, h: `You keep ${NODE}%.`, p: `You’re paid for every job it completes. ${REF}% goes to whoever referred the user.`, status: 'Running · serving the network' },
];

function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const fan = useRef<SVGGElement>(null);
  const angle = useRef(0);
  const speed = useRef(0);
  const [step, setStep] = useState(0);

  useScrollProgress(ref, (p, dt) => {
    const s = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length * 0.999));
    setStep((o) => (o === s ? o : s));
    if (!fan.current) return;
    // deg per ms: still at first, spins up while the node starts, full whir once it serves
    const target = reducedMotion() ? 0 : p < 0.1 ? 0 : p < 0.33 ? (p - 0.1) * 1.4 : 0.95;
    speed.current += (target - speed.current) * Math.min(1, dt / 420);
    angle.current = (angle.current + speed.current * dt) % 360;
    fan.current.setAttribute('transform', `rotate(${angle.current} 50 50)`);
    fan.current.style.filter = speed.current > 0.5 ? `blur(${Math.min(1.1, (speed.current - 0.5) * 2.4)}px)` : '';
  }, true);

  const running = step >= 1;
  return (
    <section className="fan-story" ref={ref} aria-label="How it works">
      <div className="fan-pin">
        <div className="wrap fan-grid">
          <div className="fan-visual">
            <div className="fan-wrap">
              <svg viewBox="0 0 100 100" className="fan-rings" aria-hidden="true">
                {[34, 40, 46].map((r) => <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#E5E5EA" strokeWidth=".18" />)}
              </svg>
              <svg viewBox="10 10 80 80" className="fan-svg" aria-hidden="true">
                <circle cx="50" cy="50" r="40" fill="#1D1D1F" />
                <g ref={fan}><Blades /></g>
              </svg>
            </div>
            <div className={`fan-status${running ? ' on' : ''}`}>
              <span className={`led${running ? '' : ' off'}`} />
              {STEPS[step].status}
            </div>
          </div>
          <div className="fan-copy">
            <div className="how-head"><span className="kicker">How it works</span></div>
            <div className="fan-steps" role="list">
              {STEPS.map((s, i) => <span role="listitem" key={s.k} className={i === step ? 'on' : i < step ? 'past' : ''}>{s.k}</span>)}
            </div>
            <div className="fan-text">
              {STEPS.map((s, i) => (
                <div key={s.k} className={`fan-panel${i === step ? ' on' : ''}`} aria-hidden={i !== step}>
                  <h2>{s.h}</h2>
                  <p>{s.p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ page */

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const stats = useNetworkStats();
  const connected = useSocketConnected();
  const [copied, setCopied] = useState(false);
  const base = `${apiOrigin()}/v1`;
  useReveal(root);

  const copy = async () => {
    await copyText(base);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const live = connected && !!stats;
  const nodes = stats?.nodesOnline ?? 0;

  return (
    <div className="landing" ref={root}>
      {/* ------------------------------------------------------------ hero */}
      <header className="hero">
        <div className="wrap">
          <Link to="/network" className={`status-pill${live && nodes ? ' on' : ''}`} data-reveal>
            <span className={`led${live && nodes ? '' : ' off'}`} />
            {live ? (nodes ? `${fmtInt(nodes)} ${nodes === 1 ? 'node' : 'nodes'} online` : 'Network online') : 'Network status'}
            <span className="chev">›</span>
          </Link>
          <h1 className="hero-h1">Spare power, shared.</h1>
          <p className="hero-sub">
            AI chat, image creation and an OpenAI&#8209;compatible API, served by everyday computers. Run a node and keep {NODE}% of what it serves.
          </p>
          <div className="hero-cta">
            <Link to="/chat" className="btn btn-ink btn-lg">Start chatting</Link>
            <Link to="/earn" className="btn btn-text btn-lg">Run a node ›</Link>
          </div>
        </div>
        <HeroWindow />
      </header>

      <div style={{ height: 'clamp(80px, 10vw, 140px)' }} />

      {/* ------------------------------------------------------------ how it works */}
      <HowItWorks />

      {/* ------------------------------------------------------------ use it */}
      <section className="sect paper">
        <div className="wrap">
          <div className="sect-head">
            <p className="kicker" data-reveal>Use it</p>
            <Lines lines={['AI for everyone,', 'served by everyone.']} />
          </div>
          <div className="use">
            <Link to="/chat" className="tile-b" data-reveal>
              <div className="tb-copy">
                <h3>Chat</h3>
                <p>Open models that answer in real time, search the web when it helps, and think step by step when you ask them to.</p>
                <span className="more">Start chatting ›</span>
              </div>
              <div className="mini-chat" aria-hidden="true">
                <div className="mc-u">What should I cook with leeks and two eggs?</div>
                <div className="mc-a"><span /><span /><span style={{ width: '62%' }} /></div>
                <div className="mc-bar"><span className="chip-m">Whir Max</span><span className="chip-m ghost">Think</span><span className="mc-send">↑</span></div>
              </div>
            </Link>
            <Link to="/create" className="tile-b" data-reveal>
              <div className="tb-copy">
                <h3>Create</h3>
                <p>Images from a sentence, rendered on someone’s graphics card. Your history stays in your browser.</p>
                <span className="more">Open Create ›</span>
              </div>
              <div className="canvas-mock" aria-hidden="true">
                <div className="cm-frame"><LogoMark size={44} /></div>
                <div className="cm-ratios"><i style={{ width: 14 }} /><i style={{ width: 18 }} /><i style={{ width: 10 }} /></div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ run a node */}
      <section className="sect">
        <div className="wrap run-sect">
          <div>
            <p className="kicker" data-reveal>Earn</p>
            <Lines lines={['Run a node.', `Keep ${NODE}%.`]} />
            <ul className="facts">
              <li data-reveal><span><b>Runs on your own computer or GPU.</b> Use Ollama, llama.cpp or any OpenAI&#8209;compatible server, or a browser tab.</span></li>
              <li data-reveal><span><b>Serves chat, images and API requests</b> routed to it by the network.</span></li>
              <li data-reveal><span><b>You keep {NODE}% per job.</b> Paid for every job it completes.</span></li>
            </ul>
            <Link to="/earn" className="btn btn-ink btn-lg" data-reveal>Set up a node ›</Link>
          </div>
          <div className="node-big" data-reveal aria-label="Node status, as shown in the node app">
            <div className="nb-top">
              <LogoMark size={56} spin />
              <div>
                <b>Your node</b>
                <span><span className="led" />Running · serving the network</span>
              </div>
            </div>
            <div className="nb-rows">
              <div><span>Serves</span><b>Chat · Create · API</b></div>
              <div><span>Paid</span><b>Per completed job</b></div>
              <div><span>Referrer share</span><b>{REF}%</b></div>
            </div>
            <div className="nb-keep"><span className="num">{NODE}%</span><span>of what it serves<br />is yours.</span></div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ api */}
      <section className="sect api-sect">
        <div className="wrap api-grid">
          <div>
            <p className="kicker" data-reveal>API</p>
            <Lines lines={['One API.', 'Many machines.']} />
            <p className="sub" data-reveal>OpenAI&#8209;compatible. Swap the base URL and the key; streaming, tools and usage work as you expect.</p>
            <Link to="/settings#keys" className="btn btn-light btn-lg" data-reveal>Get an API key ›</Link>
          </div>
          <div className="api-code" data-reveal>
            <div className="ac-head">
              <span>python</span>
              <button className={`copy-pill${copied ? ' copied' : ''}`} onClick={copy} title="Copy the base URL">
                <span className="mono">{base.replace(/^https?:\/\//, '')}</span><b>{copied ? 'Copied' : 'Copy'}</b>
              </button>
            </div>
            <pre aria-label="Example request">
{`from openai import OpenAI

client = OpenAI(
    base_url="`}<span className="s">{base}</span>{`",  `}<span className="c"># the only change</span>{`
    api_key="sk-whir-…",
)

stream = client.chat.completions.create(
    model="whir-max",
    messages=[{"role": "user", "content": "Hello"}],
    stream=True,
)`}</pre>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ pricing */}
      <section className="sect paper">
        <div className="wrap">
          <div className="sect-head row-between" style={{ alignItems: 'flex-end' }}>
            <div>
              <p className="kicker" data-reveal>Pricing</p>
              <Lines lines={['Pay for what', 'you use.']} />
            </div>
            <Link className="btn btn-ghost" to="/pricing" data-reveal>All plans ›</Link>
          </div>
          <div className="prices">
            <div className="price-c" data-reveal>
              <h3>Chat</h3>
              <p>Start free, no account needed. Plans add a daily credit grant.</p>
              <div className="pv">${PLANS.free.priceUsd} <small>to start</small></div>
            </div>
            <div className="price-c" data-reveal>
              <h3>Create</h3>
              <p>A flat price per image, whatever the prompt.</p>
              <div className="pv">{IMAGE_CREDITS} <small>credits per image</small></div>
            </div>
            <div className="price-c" data-reveal>
              <h3>API</h3>
              <p>Per million tokens, in and out. Charged to the exact token.</p>
              <div className="pv">${PRICE_IN_PER_M_USD.toFixed(2)} <small>/ ${PRICE_OUT_PER_M_USD.toFixed(2)} per M</small></div>
            </div>
          </div>
          <p className="price-note" data-reveal>Nodes keep {NODE}% of every job. {REF}% to referrers.</p>
        </div>
      </section>

      {/* ------------------------------------------------------------ closing */}
      <section className="closing">
        <div className="wrap">
          <div className="final-fan" aria-hidden="true"><LogoMark size={72} spin /></div>
          <Lines lines={['Spare power, shared.']} />
          <div className="hero-cta" data-reveal>
            <Link to="/chat" className="btn btn-ink btn-lg">Get started</Link>
            <Link to="/earn" className="btn btn-text btn-lg">Run a node ›</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
