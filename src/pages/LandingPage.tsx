import React, { CSSProperties, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsDiscord, BsGithub } from 'react-icons/bs';
import { FaRegCopy } from 'react-icons/fa';
import { useLatestCliRelease } from '../hooks/useLatestCliRelease';

const GREEN = '#00ff41';
const BACKGROUND = '#0a1a0a';
const DARK_BACKGROUND = '#050a05';
const GRID = '#123312';
const SHADOW_GREEN = '#005c16';

const TYPING_TEXT = [
  "$ git commit -m 'feat: add authentication system'",
  '$ git push origin main',
  "$ git commit -m 'fix: resolve memory leak in data parser'",
  '$ git push origin feature/new-dashboard',
];

const XP_ACTIONS = [
  {
    cmd: 'base push event',
    icon: '⚔',
    title: 'PUSH EVENT',
    xp: '+10 XP',
    desc: 'Every push to GitHub starts your journey. Base XP awarded automatically.',
  },
  {
    cmd: 'file changes',
    icon: '📝',
    title: 'FILE CHANGES',
    xp: '+1 XP/file',
    desc: 'Each file you modify or add contributes to your power. Stack them up.',
  },
  {
    cmd: 'class multiplier',
    icon: '✨',
    title: 'CLASS BONUS',
    xp: 'Up to 2x',
    desc: 'Your class amplifies XP based on the languages you code in. Choose wisely.',
  },
  {
    cmd: 'good commit message',
    icon: '📜',
    title: 'MEANINGFUL MESSAGE',
    xp: '+2 XP',
    desc: 'Commit messages over 50 characters earn bonus XP. Tell your story.',
  },
  {
    cmd: 'streak rewards',
    icon: '🔥',
    title: 'DAILY STREAK',
    xp: 'Achievement',
    desc: 'Code every day to maintain your streak and unlock special achievements.',
  },
  {
    cmd: 'gold rewards',
    icon: '💰',
    title: 'GOLD DROPS',
    xp: '+10 Gold',
    desc: 'Quality commits with good messages and content award gold for the shop.',
  },
];

const CLI_LINES = [
  { delay: 0, type: 'input', text: '$ commitquest dashboard' },
  { delay: 0.2, type: 'output', text: '🏰 Loading your CommitQuest Dashboard...' },
  { delay: 0.3, type: 'output', text: '' },
  { delay: 0.4, type: 'hero', text: '👤 Logged in as: NoahCCB' },
  { delay: 0.5, type: 'output', text: '' },
  { delay: 0.6, type: 'hero', text: '👤 Your Character' },
  { delay: 0.7, type: 'output', text: '' },
  { delay: 0.8, type: 'stat', text: 'Name: Boots' },
  { delay: 0.9, type: 'stat', text: 'Class: ⚔️ Full-Stack Fighter' },
  { delay: 1.0, type: 'stat', text: 'Species: 👤 Goblin' },
  { delay: 1.1, type: 'divider', text: '──────────────────────────────────────────────────' },
  { delay: 1.2, type: 'output', text: '' },
  { delay: 1.3, type: 'hero', text: '🏰 CommitQuest Dashboard' },
  { delay: 1.4, type: 'output', text: '' },
  { delay: 1.5, type: 'hero', text: '⚔️  Player Stats:' },
  { delay: 1.6, type: 'stat', text: '  Level Progress:' },
  { delay: 1.7, type: 'stat', text: '  Lv 5 [████████░░░░░░░░░░░░] Lv 6' },
  { delay: 1.8, type: 'stat', text: '  96/253 XP (37.94%)' },
  { delay: 1.9, type: 'stat', text: '  Total XP: 602' },
  { delay: 2.0, type: 'stat', text: '  Experience: 602 XP' },
  { delay: 2.1, type: 'stat', text: '  Commits: 37' },
  { delay: 2.2, type: 'stat', text: '  Streak: 2 days' },
  { delay: 2.3, type: 'output', text: '' },
  { delay: 2.4, type: 'hero', text: '👤 Character:' },
  { delay: 2.5, type: 'stat', text: '  Name: Boots' },
  { delay: 2.6, type: 'output', text: '' },
  { delay: 2.7, type: 'hero', text: '🏆 Recent Achievements:' },
  { delay: 2.8, type: 'item', text: "  🕯️ Flame Keeper" },
  { delay: 2.9, type: 'item', text: "  🍃 Druid's Patience" },
  { delay: 3.0, type: 'item', text: '  📘 Adept' },
];

const milestones = [
  { lvl: 1, title: 'First Steps', xp: '50' },
  { lvl: 10, title: "Novice's Path", xp: '100' },
  { lvl: 50, title: 'Dedicated Devotee', xp: '250' },
  { lvl: 100, title: 'Century Club', xp: '500' },
  { lvl: 500, title: 'Commit Master', xp: '1000' },
  { lvl: 1000, title: 'Thousand-Blade Smith', xp: '2000' },
];

const extensionFeatures = [
  { icon: '⚡', title: 'GitHub Webhooks', desc: 'Automatic push event tracking. Every commit is captured and analyzed for XP.' },
  { icon: '🏆', title: 'Weekly Leaderboards', desc: "Compete with friends and the community. See who's earning the most XP each week." },
  { icon: '🎯', title: '49 Achievements', desc: 'Milestone and streak achievements unlock as you code. Track your progress.' },
  { icon: '🌐', title: 'Multi-Platform', desc: 'CLI, web dashboard, and VS Code extension. Your stats sync everywhere.' },
];

const pixelFont = "'Press Start 2P', monospace";
const monoFont = "'Space Mono', monospace";
const DiscordIcon = BsDiscord as React.ComponentType<{ size?: number }>;
const GithubIcon = BsGithub as React.ComponentType<{ size?: number }>;
const CopyIcon = FaRegCopy as React.ComponentType<{ size?: number }>;

const PixelBorder: React.FC<{
  children: React.ReactNode;
  glowing?: boolean;
  style?: CSSProperties;
}> = ({ children, glowing = false, style }) => (
  <div
    style={{
      position: 'relative',
      border: `2px solid ${GREEN}`,
      boxShadow: glowing ? `0 0 24px rgba(0, 255, 65, 0.24)` : 'none',
      ...style,
    }}
  >
    <span style={cornerStyle('top', 'left')} />
    <span style={cornerStyle('top', 'right')} />
    <span style={cornerStyle('bottom', 'left')} />
    <span style={cornerStyle('bottom', 'right')} />
    {children}
  </div>
);

function cornerStyle(vertical: 'top' | 'bottom', horizontal: 'left' | 'right'): CSSProperties {
  return {
    position: 'absolute',
    [vertical]: -4,
    [horizontal]: -4,
    width: 6,
    height: 6,
    background: GREEN,
  };
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [blink, setBlink] = useState(true);
  const [xp, setXp] = useState(0);
  const [copied, setCopied] = useState(false);
  const { installCommand: cliInstallCommand } = useLatestCliRelease();

  useEffect(() => {
    const line = TYPING_TEXT[lineIndex];
    if (charIndex < line.length) {
      const timeout = window.setTimeout(() => {
        setDisplayedText(line.slice(0, charIndex + 1));
        setCharIndex((current) => current + 1);
      }, 55);
      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(() => {
      setLineIndex((current) => (current + 1) % TYPING_TEXT.length);
      setCharIndex(0);
      setDisplayedText('');
      setXp((current) => (current >= 100 ? 0 : Math.min(current + 25, 100)));
    }, 1800);
    return () => window.clearTimeout(timeout);
  }, [charIndex, lineIndex]);

  useEffect(() => {
    const interval = window.setInterval(() => setBlink((current) => !current), 530);
    return () => window.clearInterval(interval);
  }, []);

  const handleCopyInstall = async () => {
    await navigator.clipboard.writeText(cliInstallCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={pageStyle}>
      <style>{landingCss}</style>

      <nav className="cq-nav" aria-label="Landing navigation">
        <div className="cq-nav-inner">
          <div className="cq-nav-tabs">
            <a className="cq-nav-link" href="#xp">Mechanics</a>
            <a className="cq-nav-link" href="#cli">CLI</a>
            <a className="cq-nav-link" href="/downloads">Download</a>
            <button className="cq-nav-link cq-nav-button" onClick={() => navigate('/login')}>Login</button>
          </div>
          <div className="cq-nav-socials">
            <a
              aria-label="GitHub"
              className="cq-nav-icon-link"
              href="https://github.com/CommitQuest"
              rel="noreferrer"
              target="_blank"
            >
              <GithubIcon size={20} />
            </a>
            <a
              aria-label="Discord"
              className="cq-nav-icon-link"
              href="https://discord.gg/XuKJJBAuKH"
              rel="noreferrer"
              target="_blank"
            >
              <DiscordIcon size={20} />
            </a>
          </div>
        </div>
      </nav>

      <main>
        <section className="cq-hero">
          <div className="cq-grid" />
          <div className="cq-content cq-hero-content">
            <div className="cq-center cq-mb-8">
              <PixelBorder style={{ padding: '8px 16px' }}>
                <span className="cq-eyebrow">OPEN SOURCE · v0.1.0 · CLI · IDE EXTENSION · PLATFORM</span>
              </PixelBorder>
            </div>

            <h1 className="cq-title">
              COMMIT
              <br />
              QUEST
            </h1>

            <p className="cq-subtitle">
              Turn your git workflow into an epic RPG adventure. Every commit earns XP.
              Every push levels your hero. Every merge unlocks legendary loot.
            </p>

            <div className="cq-center cq-mb-10">
              <PixelBorder style={{ padding: '16px 24px', width: '100%', maxWidth: 460 }}>
                <div className="cq-xp-row">
                  <span className="cq-tiny">XP</span>
                  <div className="cq-xp-track">
                    <div className="cq-xp-fill" style={{ width: `${xp}%` }} />
                  </div>
                  <span className="cq-tiny">{xp}/100</span>
                </div>
                <div className="cq-terminal-line">
                  {displayedText}
                  <span style={{ visibility: blink ? 'visible' : 'hidden' }}>█</span>
                </div>
              </PixelBorder>
            </div>

            <div className="cq-cta-row">
              <button className="cq-primary-button" onClick={() => navigate('/login')}>
                START YOUR ADVENTURE
              </button>
              <div className="cq-install-group">
                <div className="cq-install-chip">$ {cliInstallCommand}</div>
                <button
                  aria-label="Copy install command"
                  className="cq-copy-button cq-hero-copy-button"
                  onClick={handleCopyInstall}
                  title={copied ? 'Copied!' : 'Copy install command'}
                >
                  {copied ? '✓' : <CopyIcon size={20} />}
                </button>
              </div>
            </div>

            <div className="cq-scroll-hint">
              <div>SCROLL TO EXPLORE</div>
              <div className="cq-bounce">▼</div>
            </div>
          </div>
        </section>

        <Divider />

        <section className="cq-section" id="xp">
          <div className="cq-content">
            <SectionHeading eyebrow="═══ THE MECHANICS ═══" title="HOW YOU EARN XP" />

            <div className="cq-card-grid">
              {XP_ACTIONS.map((action, index) => (
                <PixelBorder key={action.cmd} style={{ padding: 20 }}>
                  <div className="cq-action-header">
                    <span className="cq-action-icon">{action.icon}</span>
                    <div>
                      <div className="cq-card-title">{action.title}</div>
                      <div className="cq-card-command">{action.cmd}</div>
                    </div>
                    <div className="cq-xp-badge">{action.xp}</div>
                  </div>
                  <p className="cq-card-copy">{action.desc}</p>
                  <div className="cq-card-footer">ACTION #{String(index + 1).padStart(2, '0')}</div>
                </PixelBorder>
              ))}
            </div>

            <div className="cq-milestones">
              <PixelBorder glowing style={{ padding: 32 }}>
                <div className="cq-card-title cq-center-text">ACHIEVEMENT MILESTONES</div>
                <div className="cq-milestone-row">
                  {milestones.map((tier, index) => (
                    <React.Fragment key={tier.lvl}>
                      <div className="cq-milestone">
                        <div className="cq-card-title">
                          {tier.lvl === 1 ? `${tier.lvl} COMMIT` : `${tier.lvl} COMMITS`}
                        </div>
                        <div className="cq-card-command">{tier.title}</div>
                        <div className="cq-card-command">+{tier.xp} XP</div>
                      </div>
                      {index < milestones.length - 1 && <div className="cq-arrow">──▶</div>}
                    </React.Fragment>
                  ))}
                </div>
              </PixelBorder>
            </div>
          </div>
        </section>

        <Divider />

        <section className="cq-section" id="cli">
          <div className="cq-content cq-narrow">
            <SectionHeading eyebrow="═══ THE EXTENSION ═══" title="CLI EXPERIENCE" />

            <div className="cq-cli-grid">
              <PixelBorder glowing>
                <div className="cq-terminal-bar">
                  <span className="cq-dot cq-dot-red" />
                  <span className="cq-dot cq-dot-yellow" />
                  <span className="cq-dot cq-dot-green" />
                  <span className="cq-terminal-title">commitquest — zsh</span>
                </div>
                <div className="cq-terminal">
                  {CLI_LINES.map((line, index) => (
                    <div
                      key={`${line.text}-${index}`}
                      className="cq-terminal-output"
                      style={{
                        animationDelay: `${line.delay}s`,
                        height: line.type === 'output' ? 8 : 'auto',
                        opacity: line.type === 'output' ? 0 : undefined,
                        fontWeight: line.type === 'input' ? 700 : 400,
                      }}
                    >
                      {line.text}
                    </div>
                  ))}
                </div>
              </PixelBorder>

              <div className="cq-feature-stack">
                <PixelBorder style={{ padding: 24 }}>
                  <div className="cq-feature-label">▸ INSTALL THE CLI</div>
                  <div className="cq-copy-row">
                    <span>{cliInstallCommand}</span>
                    <button className="cq-copy-button" onClick={handleCopyInstall}>
                      {copied ? '✓ COPIED' : 'COPY'}
                    </button>
                  </div>
                </PixelBorder>

                {extensionFeatures.map((feature) => (
                  <div className="cq-feature-card" key={feature.title}>
                    <span className="cq-action-icon">{feature.icon}</span>
                    <div>
                      <div className="cq-card-title">{feature.title}</div>
                      <div className="cq-card-copy">{feature.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="cq-footer">
        <div className="cq-content cq-narrow">
          <div className="cq-footer-grid">
            <div>
              <div className="cq-footer-brand">
                COMMIT
                <br />
                QUEST
              </div>
              <p className="cq-card-copy">
                Open source. Free forever.
                <br />
                May your diffs be clean and your merges conflict-free.
              </p>
            </div>

            <div>
              <div className="cq-feature-label">▸ RESOURCES</div>
              <a className="cq-footer-link" href="/downloads">&gt; Downloads</a>
              <a className="cq-footer-link" href="https://github.com/commitquest/commitquest">&gt; GitHub Repository</a>
              <a className="cq-footer-link" href="https://discord.gg/XuKJJBAuKH" rel="noreferrer" target="_blank">&gt; Discord Guild</a>
              <a className="cq-footer-link" href="https://discord.gg/XuKJJBAuKH" rel="noreferrer" target="_blank">&gt; Support</a>
            </div>

            <div>
              <div className="cq-feature-label">▸ CLASSES</div>
              {['Web Wizard', 'Backend Barbarian', 'Data Druid', 'Full-Stack Fighter', 'Security Scout', 'QA Cleric'].map((className) => (
                <div className="cq-class-row" key={className}>◈ {className}</div>
              ))}
            </div>
          </div>

          <div className="cq-built">
            <div>BUILT WITH &lt;3 BY ADVENTURERS LIKE YOU</div>
            <div>© 2026 CommitQuest</div>
            <div>
              CHARACTER ART FROM{' '}
              <a href="https://krishna-palacio.itch.io/" rel="noreferrer" target="_blank">
                KRISHNA PALACIO&apos;S MINIFANTASY SERIES
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const SectionHeading: React.FC<{ eyebrow: string; title: string }> = ({ eyebrow, title }) => (
  <div className="cq-section-heading">
    <div className="cq-eyebrow">{eyebrow}</div>
    <h2 className="cq-section-title">{title}</h2>
  </div>
);

const Divider: React.FC = () => (
  <div className="cq-divider-wrap">
    <div className="cq-divider" />
  </div>
);

const pageStyle: CSSProperties = {
  background: DARK_BACKGROUND,
  minHeight: '100vh',
  fontFamily: monoFont,
  color: GREEN,
  overflowX: 'hidden',
};

const landingCss = `
  @keyframes fadeInLine {
    from { opacity: 0; transform: translateX(-4px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(6px); }
  }

  .cq-nav {
    background: ${DARK_BACKGROUND};
    border-bottom: 2px solid ${GREEN};
    left: 0;
    padding: 0 16px;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 30;
  }

  .cq-nav-inner {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 1280px;
    min-height: 56px;
  }

  .cq-nav-tabs,
  .cq-nav-socials {
    align-items: stretch;
    display: flex;
    gap: 4px;
  }

  .cq-nav-link {
    background: transparent;
    border: 0;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    color: ${GREEN};
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    font: 13px ${monoFont};
    letter-spacing: 0.1em;
    padding: 14px 16px;
    text-decoration: none;
    transition: all 0.15s;
  }

  .cq-nav-link:hover {
    background: ${GREEN};
    color: ${DARK_BACKGROUND};
  }

  .cq-nav-button {
    appearance: none;
  }

  .cq-nav-icon-link {
    align-items: center;
    border-bottom: 2px solid transparent;
    color: ${GREEN};
    display: inline-flex;
    justify-content: center;
    min-width: 44px;
    padding: 12px;
    text-decoration: none;
    transition: all 0.15s;
  }

  .cq-nav-icon-link:hover {
    background: ${GREEN};
    color: ${DARK_BACKGROUND};
  }

  .cq-hero {
    align-items: center;
    display: flex;
    justify-content: center;
    min-height: 100vh;
    overflow: hidden;
    padding: 96px 16px;
    position: relative;
  }

  .cq-grid {
    background-image: linear-gradient(${GRID} 1px, transparent 1px), linear-gradient(90deg, ${GRID} 1px, transparent 1px);
    background-size: 32px 32px;
    inset: 0;
    pointer-events: none;
    position: absolute;
  }

  .cq-content {
    margin: 0 auto;
    max-width: 1152px;
    position: relative;
    width: 100%;
    z-index: 1;
  }

  .cq-narrow {
    max-width: 1024px;
  }

  .cq-hero-content {
    text-align: center;
  }

  .cq-center {
    display: flex;
    justify-content: center;
  }

  .cq-center-text {
    text-align: center;
  }

  .cq-mb-8 {
    margin-bottom: 32px;
  }

  .cq-mb-10 {
    margin-bottom: 40px;
  }

  .cq-eyebrow {
    color: ${GREEN};
    font: 11px ${monoFont};
    letter-spacing: 0.15em;
  }

  .cq-title {
    color: ${GREEN};
    font-family: ${pixelFont};
    font-size: clamp(28px, 6vw, 72px);
    letter-spacing: 0.04em;
    line-height: 1.2;
    margin: 0 0 24px;
  }

  .cq-subtitle {
    color: ${GREEN};
    font: 18px/1.6 ${monoFont};
    font-size: clamp(18px, 3vw, 26px);
    letter-spacing: 0.05em;
    margin: 0 auto 40px;
    max-width: 720px;
  }

  .cq-xp-row {
    align-items: center;
    display: flex;
    gap: 12px;
    margin-bottom: 8px;
  }

  .cq-tiny {
    color: ${GREEN};
    font: 10px ${monoFont};
  }

  .cq-xp-track {
    background: #000;
    border: 2px solid ${GREEN};
    flex: 1;
    height: 14px;
    overflow: hidden;
    position: relative;
  }

  .cq-xp-fill {
    background: ${GREEN};
    height: 100%;
    transition: width 0.7s;
  }

  .cq-terminal-line {
    color: ${GREEN};
    font: 13px ${monoFont};
    min-height: 20px;
    text-align: left;
  }

  .cq-cta-row {
    align-items: center;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
  }

  .cq-primary-button {
    background: ${GREEN};
    border: 2px solid ${GREEN};
    box-shadow: 4px 4px 0 ${SHADOW_GREEN};
    color: ${DARK_BACKGROUND};
    cursor: pointer;
    font: 11px ${pixelFont};
    letter-spacing: 0.05em;
    padding: 16px 32px;
    transition: all 0.15s;
  }

  .cq-primary-button:hover {
    box-shadow: 2px 2px 0 ${SHADOW_GREEN};
    transform: translate(2px, 2px);
  }

  .cq-install-chip {
    align-items: center;
    border: 2px solid ${GREEN};
    color: ${GREEN};
    display: flex;
    font: 13px ${monoFont};
    letter-spacing: 0.08em;
    min-height: 52px;
    padding: 14px 28px;
  }

  .cq-install-group {
    align-items: stretch;
    display: flex;
    max-width: min(100%, 820px);
    width: min(100%, 820px);
  }

  .cq-install-group .cq-install-chip {
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    white-space: nowrap;
  }

  .cq-hero-copy-button {
    align-items: center;
    border-left: 0;
    display: flex;
    font-size: 20px;
    justify-content: center;
    min-height: 52px;
    padding: 0;
    width: 52px;
  }

  .cq-scroll-hint {
    align-items: center;
    color: ${GREEN};
    display: flex;
    flex-direction: column;
    font: 10px ${monoFont};
    gap: 8px;
    letter-spacing: 0.2em;
    margin-top: 64px;
  }

  .cq-bounce {
    animation: bounce 1.5s ease-in-out infinite;
    font-size: 20px;
  }

  .cq-divider-wrap {
    padding: 0 16px;
  }

  .cq-divider {
    border-top: 1px solid ${SHADOW_GREEN};
    margin: 0 auto;
    max-width: 1152px;
  }

  .cq-section {
    padding: 96px 16px;
  }

  .cq-section-heading {
    margin-bottom: 64px;
    text-align: center;
  }

  .cq-section-title {
    color: ${GREEN};
    font-family: ${pixelFont};
    font-size: clamp(14px, 3vw, 24px);
    line-height: 1.4;
    margin: 16px 0 0;
  }

  .cq-card-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .cq-action-header {
    align-items: flex-start;
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }

  .cq-action-icon {
    font-size: 24px;
    line-height: 1;
  }

  .cq-card-title {
    color: ${GREEN};
    font-family: ${pixelFont};
    font-size: 9px;
    letter-spacing: 0.1em;
    line-height: 1.5;
  }

  .cq-card-command {
    color: ${GREEN};
    font: 10px ${monoFont};
    margin-top: 4px;
  }

  .cq-xp-badge {
    background: ${BACKGROUND};
    border: 2px solid ${GREEN};
    color: ${GREEN};
    font: 9px ${pixelFont};
    margin-left: auto;
    padding: 4px 8px;
    white-space: nowrap;
  }

  .cq-card-copy {
    color: ${GREEN};
    font: 13px/1.4 ${monoFont};
    margin: 0;
  }

  .cq-card-footer {
    border-top: 2px solid ${GREEN};
    color: ${GREEN};
    font: 9px ${monoFont};
    letter-spacing: 0.1em;
    margin-top: 12px;
    padding-top: 8px;
  }

  .cq-milestones {
    margin-top: 64px;
  }

  .cq-milestone-row {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    justify-content: center;
    margin-top: 32px;
  }

  .cq-milestone {
    align-items: center;
    display: flex;
    flex-direction: column;
    padding: 8px 16px;
    text-align: center;
  }

  .cq-arrow {
    color: ${GREEN};
    font: 16px monospace;
  }

  .cq-cli-grid {
    align-items: flex-start;
    display: grid;
    gap: 32px;
    grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
  }

  .cq-cli-grid > * {
    min-width: 0;
  }

  .cq-terminal-bar {
    align-items: center;
    background: ${BACKGROUND};
    border-bottom: 2px solid ${GREEN};
    display: flex;
    gap: 8px;
    padding: 10px 16px;
  }

  .cq-dot {
    display: inline-block;
    height: 8px;
    width: 8px;
  }

  .cq-dot-red { background: #ff3333; }
  .cq-dot-yellow { background: #ffd700; }
  .cq-dot-green { background: ${GREEN}; }

  .cq-terminal-title {
    color: ${GREEN};
    font: 11px ${monoFont};
    margin-left: 8px;
  }

  .cq-terminal {
    background: #000;
    font: 13px/1.7 ${monoFont};
    max-height: 620px;
    overflow-x: auto;
    overflow-y: auto;
    padding: 20px;
  }

  .cq-terminal-output {
    animation: fadeInLine 0.2s ease forwards;
    animation-fill-mode: both;
    color: ${GREEN};
    opacity: 0;
    white-space: pre;
  }

  .cq-feature-stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .cq-feature-label {
    color: ${GREEN};
    font: 10px ${monoFont};
    letter-spacing: 0.2em;
    margin-bottom: 12px;
  }

  .cq-copy-row {
    align-items: center;
    background: #000;
    border: 2px solid ${GREEN};
    color: ${GREEN};
    display: flex;
    gap: 12px;
    font: 14px ${monoFont};
    padding: 12px 16px;
  }

  .cq-copy-row span {
    flex: 1;
    overflow-x: auto;
    white-space: nowrap;
  }

  .cq-copy-button {
    background: transparent;
    border: 2px solid ${GREEN};
    color: ${GREEN};
    cursor: pointer;
    font: 11px ${monoFont};
    padding: 4px 10px;
    transition: all 0.15s;
  }

  .cq-copy-button:hover {
    background: ${GREEN};
    color: ${DARK_BACKGROUND};
  }

  .cq-feature-card {
    background: ${BACKGROUND};
    border: 2px solid ${GREEN};
    display: flex;
    gap: 16px;
    padding: 16px;
  }

  .cq-footer {
    border-top: 2px solid ${GREEN};
    padding: 64px 16px;
  }

  .cq-footer-grid {
    display: grid;
    gap: 48px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-bottom: 48px;
  }

  .cq-footer-brand {
    color: ${GREEN};
    font: 16px/1.35 ${pixelFont};
    margin-bottom: 12px;
  }

  .cq-footer-link {
    color: ${GREEN};
    display: block;
    font: 13px ${monoFont};
    margin-bottom: 8px;
    text-decoration: none;
  }

  .cq-footer-link:hover {
    text-decoration: underline;
  }

  .cq-class-row {
    color: ${GREEN};
    font: 13px ${monoFont};
    margin-bottom: 8px;
  }

  .cq-built {
    align-items: center;
    border-top: 2px solid ${GREEN};
    color: ${GREEN};
    display: flex;
    flex-direction: column;
    font: 11px ${monoFont};
    gap: 8px;
    letter-spacing: 0.15em;
    padding-top: 24px;
    text-align: center;
  }

  .cq-built a {
    color: ${GREEN};
    text-decoration: underline;
  }

  .cq-built a:hover {
    color: #8aff9f;
  }

  @media (max-width: 900px) {
    .cq-card-grid,
    .cq-cli-grid,
    .cq-footer-grid {
      grid-template-columns: 1fr;
    }

    .cq-nav {
      padding: 0 8px;
    }

    .cq-nav-inner {
      flex-wrap: wrap;
      justify-content: center;
      padding: 4px 0;
    }

    .cq-nav-tabs {
      flex-wrap: wrap;
      justify-content: center;
    }

    .cq-nav-link {
      font-size: 9px;
      padding: 8px;
    }

    .cq-nav-icon-link {
      min-width: 36px;
      padding: 8px;
    }

    .cq-terminal {
      max-height: none;
    }
  }

  @media (max-width: 520px) {
    .cq-cta-row,
    .cq-copy-row {
      align-items: stretch;
      flex-direction: column;
    }

    .cq-primary-button,
    .cq-install-chip {
      width: 100%;
    }

    .cq-arrow {
      display: none;
    }

    .cq-section {
      padding-left: 12px;
      padding-right: 12px;
    }

    .cq-terminal-bar {
      padding: 8px 10px;
    }

    .cq-terminal-title {
      font-size: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .cq-terminal {
      font-size: 11px;
      line-height: 1.65;
      padding: 14px 10px;
    }

    .cq-terminal-output {
      overflow-wrap: anywhere;
      white-space: pre-wrap;
    }

    .cq-feature-card {
      align-items: flex-start;
      gap: 12px;
      padding: 14px;
    }
  }
`;

export default LandingPage; 