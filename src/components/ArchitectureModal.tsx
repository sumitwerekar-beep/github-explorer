import {
  Activity,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck,
  Timer,
  X,
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ArchitectureModal({ isOpen, onClose }: ArchitectureModalProps): React.JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} data-testid="architecture-modal">
      <div className="modal-content architecture-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Cpu size={22} className="text-accent" />
            <div>
              <h3 className="modal-title">Architecture & System Design</h3>
              <span className="modal-subtitle">How this GitHub Explorer works under the hood</span>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="architecture-body">
          {/* Section 1: Core Architecture Pipeline */}
          <div className="arch-card">
            <div className="arch-card-header">
              <Layers size={18} className="text-accent" />
              <h4>1. Modular Layered Architecture</h4>
            </div>
            <div className="arch-flow-diagram">
              <div className="flow-step">
                <span className="flow-step-tag">UI View</span>
                <strong>SearchBar & Cards</strong>
                <p>User input, sort & filters</p>
              </div>
              <span className="flow-arrow">→</span>
              <div className="flow-step">
                <span className="flow-step-tag">Hook Layer</span>
                <strong>useGitHubSearch</strong>
                <p>Debounce & AbortController</p>
              </div>
              <span className="flow-arrow">→</span>
              <div className="flow-step">
                <span className="flow-step-tag">Service Layer</span>
                <strong>githubApi.ts</strong>
                <p>Header parsing & rate tracking</p>
              </div>
              <span className="flow-arrow">→</span>
              <div className="flow-step">
                <span className="flow-step-tag">Transformation</span>
                <strong>formatters.ts</strong>
                <p>Percentages & SVG charts</p>
              </div>
            </div>
          </div>

          {/* Section 2: Standout Engineering Features */}
          <div className="arch-grid-two">
            {/* Feature 1: Debounced Search & Stale Abort */}
            <div className="arch-card">
              <div className="arch-card-header">
                <Timer size={18} className="text-accent" />
                <h4>2. Debounce & Abort Controller</h4>
              </div>
              <ul className="arch-bullet-list">
                <li>
                  <strong>450ms Debounce Window:</strong> Search input changes do not fire immediate API calls, protecting rate limits.
                </li>
                <li>
                  <strong>In-Flight Request Cancellation:</strong> Whenever a new search term or filter triggers, previous active HTTP requests are aborted via <code>AbortController.abort()</code>, ensuring stale responses never overwrite fresh searches.
                </li>
              </ul>
            </div>

            {/* Feature 2: Rate Limit Resilience & Fallbacks */}
            <div className="arch-card">
              <div className="arch-card-header">
                <ShieldCheck size={18} className="text-accent" />
                <h4>3. Rate Limit & Error Resilience</h4>
              </div>
              <ul className="arch-bullet-list">
                <li>
                  <strong>Header Tracking:</strong> Extracts <code>x-ratelimit-remaining</code> and <code>x-ratelimit-reset</code> on every response.
                </li>
                <li>
                  <strong>Automatic Reset Timer:</strong> Displays live countdown when 403 / 429 occurs.
                </li>
                <li>
                  <strong>Demo Mode Fallback:</strong> Instant fallback mock data prevents app breakdown if limits are reached.
                </li>
                <li>
                  <strong>Token Injection:</strong> Supports optional PAT for 5,000 req/hr.
                </li>
              </ul>
            </div>

            {/* Feature 3: Data Transformation & Visualizations */}
            <div className="arch-card">
              <div className="arch-card-header">
                <Activity size={18} className="text-accent" />
                <h4>4. Data Transformations & Charts</h4>
              </div>
              <ul className="arch-bullet-list">
                <li>
                  <strong>Language Proportions:</strong> Normalizes raw code byte counts into sorted percentages with GitHub linguist color mapping.
                </li>
                <li>
                  <strong>52-Week Commit Trend:</strong> Aggregates yearly activity into SVG area/bar charts with tooltips and peak velocity detection.
                </li>
                <li>
                  <strong>Missing Data Safety:</strong> Null descriptions, zero languages, and missing licenses are safely sanitized.
                </li>
              </ul>
            </div>

            {/* Feature 4: Comprehensive Test Suite */}
            <div className="arch-card">
              <div className="arch-card-header">
                <CheckCircle2 size={18} className="text-accent" />
                <h4>5. Automated Test Suite</h4>
              </div>
              <ul className="arch-bullet-list">
                <li>
                  <strong>API & Async Tests:</strong> Mocking fetch, 403 rate limits, 404 errors, auth token headers, and abort signals.
                </li>
                <li>
                  <strong>Transformation Tests:</strong> Number abbreviations (<code>1.2k</code>, <code>2.5M</code>), language calculations, date formatters.
                </li>
                <li>
                  <strong>Hook & State Tests:</strong> Debounce timing, search pagination, filter updates, loading states.
                </li>
                <li>
                  <strong>Component Tests:</strong> Rendering edge cases with zero/missing fields.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            Got it, Let's Explore!
          </button>
        </div>
      </div>
    </div>
  );
}
