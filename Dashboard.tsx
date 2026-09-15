import Link from "next/link";
import { db } from "../lib/prisma";
import LogoutButton from "./LogoutButton";

export default async function Dashboard({ user }: { user: any }) {
  const tests = await db.test.findMany({ where: { published: true }, orderBy: { testNo: "asc" } });
  const attempts = await db.attempt.findMany({ where: { userId: user.id }, orderBy: { startedAt: "desc" }, take: 10, include: { test: true } });
  const completed = attempts.filter((a) => a.status !== "IN_PROGRESS").length;
  const displayName = user.name || "Student";
  const firstName = displayName.split(" ")[0];

  return <div className="mx-app">
    <aside className="mx-sidebar">
      <Link href="/" className="mx-logo"><span className="mx-logo-mark">DM</span><span>Descriptive<span>Master</span></span></Link>
      <div className="mx-menu-label">MAIN MENU</div>
      <nav className="mx-menu">
        <a className="selected" href="#home"><span>⌂</span> Dashboard</a>
        <a href="#courses"><span>▣</span> My Courses</a>
        <a href="#tests"><span>▤</span> Test Series</a>
        <a href="#progress"><span>◔</span> My Progress</a>
        <a href="#practice"><span>✎</span> Practice</a>
      </nav>
      <div className="mx-menu-label">PERSONAL</div>
      <nav className="mx-menu">
        <a href="#history"><span>◷</span> Attempt History</a>
        <a href="#help"><span>?</span> Help & Support</a>
      </nav>
      <div className="mx-sidebar-bottom">
        <div className="mx-upgrade"><b>IBPS PO Mains</b><small>Descriptive preparation</small><div className="mx-progress-line"><i /></div><span>Keep practising!</span></div>
        <LogoutButton />
      </div>
    </aside>

    <div className="mx-main">
      <header className="mx-header">
        <div className="mx-breadcrumb"><span>Dashboard</span><b>›</b><strong>Home</strong></div>
        <div className="mx-header-right"><div className="mx-search">⌕ <span>Search courses, tests...</span></div><button className="mx-icon-btn" aria-label="Notifications">♧</button><div className="mx-profile"><div className="mx-avatar">{displayName.slice(0,1).toUpperCase()}</div><div><b>{displayName}</b><small>IBPS PO Aspirant</small></div><span>⌄</span></div></div>
      </header>

      <main id="home" className="mx-content">
        <section className="mx-welcome">
          <div><div className="mx-kicker">WELCOME BACK 👋</div><h1>Hi, {firstName}! Ready to improve your score?</h1><p>Continue your preparation and practise the IBPS PO descriptive paper like the real exam.</p></div>
          <a href="#courses" className="mx-primary-btn">Continue Learning <span>→</span></a>
        </section>

        <section className="mx-stats" id="progress">
          <div className="mx-stat"><div className="mx-stat-icon purple">▤</div><div><small>Tests Attempted</small><b>{attempts.length}</b><em>Keep going</em></div></div>
          <div className="mx-stat"><div className="mx-stat-icon blue">✓</div><div><small>Tests Completed</small><b>{completed}</b><em>Completed tests</em></div></div>
          <div className="mx-stat"><div className="mx-stat-icon orange">◷</div><div><small>Exam Duration</small><b>30 <small>min</small></b><em>Per test</em></div></div>
          <div className="mx-stat"><div className="mx-stat-icon green">★</div><div><small>Maximum Marks</small><b>25</b><em>Per test</em></div></div>
        </section>

        <section id="courses" className="mx-section">
          <div className="mx-section-title"><div><span>MY COURSES</span><h2>Your preparation</h2><p>Access your enrolled learning folders and practice material.</p></div><a href="#courses">View all →</a></div>
          <div className="mx-course-grid">
            <a href="#descriptive-test" className="mx-course-card active-course">
              <div className="mx-course-cover"><div className="mx-cover-shape one"/><div className="mx-cover-shape two"/><div className="mx-folder">▰</div><span>IBPS PO MAINS</span></div>
              <div className="mx-course-body"><div className="mx-course-tag">ACTIVE COURSE</div><h3>IBPS PO Descriptive</h3><p>Essay Writing & Comprehension</p><div className="mx-course-foot"><span>▣ {tests.length} Tests</span><span>◷ 30 min</span><b>Open Folder →</b></div></div>
            </a>
            <div className="mx-course-card coming-course"><div className="mx-coming-icon">＋</div><h3>More courses coming soon</h3><p>New IBPS PO preparation modules will appear here.</p><span>COMING SOON</span></div>
          </div>
        </section>

        <section id="descriptive-test" className="mx-section mx-test-folder">
          <div className="mx-folder-head"><div><div className="mx-path"><span>My Courses</span><b>›</b><strong>IBPS PO Descriptive</strong></div><h2>Descriptive Test</h2><p>Choose a test below. Each test follows the actual 25-mark, 30-minute pattern.</p></div><div className="mx-folder-stats"><b>{tests.length}</b><span>Tests available</span></div></div>
          {tests.length === 0 ? <div className="mx-empty">No published descriptive tests are available yet.</div> : <div className="mx-test-grid">{tests.map((t, i) => {
            const previous = attempts.find((a) => a.testId === t.id && a.status !== "IN_PROGRESS");
            return <article className="mx-test-card" key={t.id}>
              <div className="mx-test-card-top"><span className="mx-test-no">TEST {String(i + 1).padStart(2,"0")}</span><span className="mx-available">AVAILABLE</span></div>
              <div className="mx-test-icon">✍</div><h3>Descriptive Test {i + 1}</h3><p>IBPS PO • Essay + Comprehension</p>
              <div className="mx-test-info"><span>❔ 2 Sections</span><span>✓ 25 Marks</span><span>◷ 30 Mins</span><span>◉ English</span></div>
              <div className="mx-test-status">{previous ? `Attempted • ${new Date(previous.startedAt).toLocaleDateString("en-IN")}` : "Available now"}</div>
              <Link className="mx-test-btn" href={`/test/${t.testNo}`}>{previous ? "Reattempt Test" : "Start Test"}<span>→</span></Link>
            </article>;
          })}</div>}
        </section>

        <section id="practice" className="mx-section mx-practice">
          <div className="mx-section-title"><div><span>QUICK PRACTICE</span><h2>Build your descriptive skills</h2><p>Focused practice for the areas that matter most in the exam.</p></div></div>
          <div className="mx-practice-grid"><div><span>✍️</span><h3>Essay Writing</h3><p>Improve structure, introduction, arguments and conclusion.</p></div><div><span>📖</span><h3>Comprehension</h3><p>Practise reading quickly and answering in your own words.</p></div><div><span>🎯</span><h3>Exam Strategy</h3><p>Learn how to manage 25 marks in a strict 30-minute window.</p></div></div>
        </section>

        <section id="history" className="mx-section mx-history">
          <div className="mx-section-title"><div><span>RECENT ACTIVITY</span><h2>Recent attempts</h2></div></div>
          {attempts.length === 0 ? <div className="mx-empty">No attempts yet. Open the Descriptive Test folder and start your first test.</div> : <div className="mx-history-list">{attempts.slice(0,5).map(a=><div className="mx-history-row" key={a.id}><div className="mx-history-icon">✍</div><div><b>Descriptive Test {a.test.testNo}</b><small>{new Date(a.startedAt).toLocaleString("en-IN")}</small></div><span className={`mx-status ${String(a.status).toLowerCase()}`}>{String(a.status).replaceAll("_"," ")}</span><Link href={`/test/${a.test.testNo}`}>Open →</Link></div>)}</div>}
        </section>

        <section id="help" className="mx-help"><div><b>Need help with your preparation?</b><span>Practise consistently and use the test environment to build exam-day confidence.</span></div><a href="#practice">Explore Practice →</a></section>
      </main>
      <footer className="mx-footer"><b>DescriptiveMaster</b><span>IBPS PO Descriptive Practice</span><span>© 2026 DescriptiveMaster</span></footer>
    </div>
  </div>;
}
