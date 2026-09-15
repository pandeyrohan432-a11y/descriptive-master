import Link from "next/link";
import { db } from "../lib/prisma";
import LogoutButton from "./LogoutButton";

export default async function Dashboard({ user }: { user: any }) {
  const tests = await db.test.findMany({ where: { published: true }, orderBy: { testNo: "asc" } });
  const attempts = await db.attempt.findMany({ where: { userId: user.id }, orderBy: { startedAt: "desc" }, take: 10, include: { test: true } });
  const completed = attempts.filter((a) => a.status !== "IN_PROGRESS").length;
  const displayName = user.name || "Student";

  return <div className="dm-app">
    <header className="dm-nav"><div className="dm-nav-inner">
      <Link href="/" className="dm-brand"><span className="dm-brand-mark">DM</span><span>Descriptive<span>Master</span></span></Link>
      <nav className="dm-nav-links"><a href="#home" className="active">Home</a><a href="#tests">Tests</a><a href="#practice">Practice</a><a href="#progress">My Progress</a></nav>
      <div className="dm-user"><div className="dm-avatar-small">{displayName.slice(0,1).toUpperCase()}</div><span>{displayName}</span><LogoutButton /></div>
    </div></header>

    <main id="home">
      <section className="dm-hero"><div className="dm-hero-inner">
        <div className="dm-hero-copy"><div className="dm-eyebrow">🎯 IBPS PO MAINS • DESCRIPTIVE</div>
          <h1>Master your <span>Descriptive</span> paper.</h1>
          <p>Practice essays and comprehension in a realistic exam environment. Build speed, structure and confidence before the real test.</p>
          <div className="dm-hero-actions"><a href="#tests" className="dm-btn dm-btn-light">Start Practice <span>→</span></a><a href="#progress" className="dm-btn dm-btn-ghost">View Progress</a></div>
          <div className="dm-trust"><span>✓</span> 25 Marks <span>✓</span> 30 Minutes <span>✓</span> 2 Questions</div>
        </div>
        <div className="dm-hero-card"><div className="dm-orbit dm-orbit-one"/><div className="dm-orbit dm-orbit-two"/><div className="dm-paper-icon">✍️</div><div className="dm-score-pill"><strong>25/25</strong><small>Target Score</small></div><div className="dm-mini-card"><span>Writing Practice</span><b>IBPS PO</b><i>30:00</i></div></div>
      </div></section>

      <section className="dm-content wide" id="progress">
        <div className="dm-stats">
          <div className="dm-stat"><span className="stat-icon purple">✍</span><div><b>{attempts.length}</b><small>Tests Attempted</small></div></div>
          <div className="dm-stat"><span className="stat-icon blue">✓</span><div><b>{completed}</b><small>Completed</small></div></div>
          <div className="dm-stat"><span className="stat-icon orange">⏱</span><div><b>30 min</b><small>Exam Duration</small></div></div>
          <div className="dm-stat"><span className="stat-icon green">★</span><div><b>25</b><small>Maximum Marks</small></div></div>
        </div>

        <div className="dm-section-head" id="tests"><div><div className="dm-kicker">SMART PRACTICE</div><h2>Choose your practice test</h2><p>Realistic IBPS PO descriptive tests designed for exam-day practice.</p></div><span className="dm-count">{tests.length} Tests Available</span></div>
        {tests.length === 0 ? <div className="dm-empty">No published tests are available yet.</div> : <div className="dm-test-grid">{tests.map((t,i)=><article className="dm-test-card" key={t.id}>
          <div className="dm-test-top"><span className="dm-test-badge">IBPS PO</span><span className="dm-test-number">#{String(i+1).padStart(2,"0")}</span></div>
          <h3>Descriptive Test {i+1}</h3><p>Essay + Comprehension</p><div className="dm-test-meta"><span>❔ 2 Qs</span><span>✓ 25 Marks</span><span>◷ 30 Mins</span></div>
          <Link className="dm-start" href={`/test/${t.testNo}`}>Start Test <span>→</span></Link>
        </article>)}</div>}

        <section className="dm-features" id="practice"><div className="dm-feature-heading"><div className="dm-kicker">WHY DESCRIPTIVE MASTER?</div><h2>Everything you need to improve.</h2><p>Focused tools for the exact skills that matter in the IBPS PO descriptive paper.</p></div><div className="dm-feature-grid">
          <div className="dm-feature"><span>🎯</span><h3>Exam-Oriented Tests</h3><p>Practice with the same 25-mark, 30-minute format you will face in the exam.</p></div>
          <div className="dm-feature"><span>✍️</span><h3>Writing Practice</h3><p>Build a repeatable structure for essays and improve your comprehension speed.</p></div>
          <div className="dm-feature"><span>📈</span><h3>Track Your Progress</h3><p>Keep your recent attempts in one place and see how consistently you practice.</p></div>
        </div></section>

        <section className="dm-history"><div className="dm-section-head compact"><div><div className="dm-kicker">YOUR ACTIVITY</div><h2>Recent attempts</h2></div></div>
          {attempts.length===0 ? <div className="dm-empty">No attempts yet. Start your first test above.</div> : <div className="dm-history-list">{attempts.map(a=><div className="dm-history-row" key={a.id}><div className="history-icon">📝</div><div className="history-main"><b>Descriptive Test {a.test.testNo}</b><small>{new Date(a.startedAt).toLocaleString()}</small></div><span className={`status status-${String(a.status).toLowerCase()}`}>{a.status.replaceAll("_"," ")}</span></div>)}</div>}
        </section>
      </section>
    </main>
    <footer className="dm-footer"><div className="dm-footer-brand"><span className="dm-brand-mark">DM</span><b>DescriptiveMaster</b></div><span>Built for IBPS PO aspirants • Practice smarter.</span></footer>
  </div>;
}
