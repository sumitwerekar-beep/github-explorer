import React, { useState } from 'react';
import { Check, KeyRound, Lock, ShieldCheck, Trash2, X } from 'lucide-react';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenSaved: () => void;
}

export function TokenModal({ isOpen, onClose, onTokenSaved }: TokenModalProps): React.JSX.Element | null {
  const [tokenInput, setTokenInput] = useState<string>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('gh_explorer_token') || '' : '';
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      localStorage.setItem('gh_explorer_token', tokenInput.trim());
    } else {
      localStorage.removeItem('gh_explorer_token');
    }
    setSavedSuccess(true);
    onTokenSaved();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    localStorage.removeItem('gh_explorer_token');
    setTokenInput('');
    onTokenSaved();
  };

  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('gh_explorer_token');

  return (
    <div className="modal-backdrop" onClick={onClose} data-testid="token-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <KeyRound size={20} className="text-accent" />
            <h3 className="modal-title">GitHub Access Token</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body">
          <p className="modal-description">
            GitHub provides <strong>60 requests/hour</strong> for unauthenticated requests. Adding a GitHub Personal
            Access Token (classic or fine-grained with <code>public_repo</code> read-only scope) increases your rate limit
            to <strong>5,000 requests/hour</strong>.
          </p>

          <div className="token-input-group">
            <label htmlFor="gh-token-input" className="token-label">
              Personal Access Token
            </label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                id="gh-token-input"
                type="password"
                className="token-input"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="security-notice">
            <ShieldCheck size={16} className="text-success" />
            <span>Tokens are stored only in your browser's local storage and sent exclusively to GitHub's official API.</span>
          </div>

          <div className="modal-actions">
            {hasToken && (
              <button type="button" className="btn-danger-outline" onClick={handleClear}>
                <Trash2 size={14} /> Remove Token
              </button>
            )}
            <div className="modal-actions-right">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {savedSuccess ? (
                  <>
                    <Check size={16} /> Saved!
                  </>
                ) : (
                  'Save Token'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
