import React from 'react';
import { MessageSquare, Send, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../ui/Modal';

interface ProfileSuggestionsProps {
  isSubmittingSuggestion: boolean;
  suggestionSuccess: boolean;
  setSuggestionSuccess?: (b: boolean) => void;
  suggestionError: string;
  registerSuggestion: any;
  handleSuggestionSubmit: any;
  suggestionErrors: any;
  onSuggestionSubmit: (data: any) => Promise<void>;
  getValidationMessage: (msg: string | undefined) => string;
}

export const ProfileSuggestions: React.FC<ProfileSuggestionsProps> = ({
  isSubmittingSuggestion,
  suggestionSuccess,
  setSuggestionSuccess,
  suggestionError,
  registerSuggestion,
  handleSuggestionSubmit,
  suggestionErrors,
  onSuggestionSubmit,
  getValidationMessage
}) => {
  const { t } = useTranslation();

  return (
    <div style={{
      background: 'rgba(168, 85, 247, 0.05)',
      border: '2px dashed rgba(168, 85, 247, 0.25)',
      borderRadius: '2rem',
      padding: '2.5rem',
      marginTop: '0'
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            background: 'rgba(168, 85, 247, 0.15)',
            width: '40px', height: '40px',
            borderRadius: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#a855f7',
            flexShrink: 0
          }}>
            <MessageSquare size={20} />
          </div>
          <h3 className="text-display" style={{ fontSize: '1.4rem', margin: 0, color: '#a855f7', lineHeight: 1.2 }}>
            {t("suggestion_title")}
          </h3>
        </div>
        <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>
          {t("suggestion_desc")}
        </p>
      </div>

      <form onSubmit={handleSuggestionSubmit(onSuggestionSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <input
            {...registerSuggestion('subject')}
            placeholder={t("suggestion_subject_placeholder")}
            disabled={isSubmittingSuggestion}
            style={{
              width: '100%', background: 'rgba(0,0,0,0.3)', border: suggestionErrors.subject ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.1)',
              color: '#fff', padding: '1rem', borderRadius: '1rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
            }}
          />
          {suggestionErrors.subject && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{getValidationMessage(suggestionErrors.subject.message)}</span>}
        </div>
        
        <div>
          <textarea
            {...registerSuggestion('message')}
            placeholder={t("suggestion_message_placeholder")}
            disabled={isSubmittingSuggestion}
            style={{
              width: '100%', background: 'rgba(0,0,0,0.3)', border: suggestionErrors.message ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.1)',
              color: '#fff', padding: '1rem', borderRadius: '1rem', fontSize: '0.9rem', fontFamily: 'inherit', minHeight: '120px', resize: 'vertical', outline: 'none', boxSizing: 'border-box'
            }}
          />
          {suggestionErrors.message && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{getValidationMessage(suggestionErrors.message.message)}</span>}
        </div>

        {suggestionError && <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{suggestionError}</div>}

        <button
          type="submit"
          disabled={isSubmittingSuggestion}
          className="btn-hover-dark"
          style={{
            background: '#a855f7', border: 'none', color: '#fff', height: '48px', borderRadius: '1.25rem',
            fontSize: '0.9rem', fontWeight: 950, cursor: isSubmittingSuggestion ? 'not-allowed' : 'pointer',
            opacity: isSubmittingSuggestion ? 0.7 : 1, alignSelf: 'flex-start', padding: '0 2rem', boxShadow: '4px 4px 0px #000',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <Send size={18} />
          {isSubmittingSuggestion ? t("sending_suggestion") : t("send_suggestion")}
        </button>
      </form>

      {/* Success Modal */}
      <Modal open={suggestionSuccess} onClose={() => setSuggestionSuccess?.(false)} showClose={true}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0.5rem 0.5rem 0 0.5rem',
          maxWidth: '380px'
        }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid rgba(16, 185, 129, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
            marginBottom: '1.25rem',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.35)'
          }}>
            <Check size={38} strokeWidth={2.5} />
          </div>
          <h3 className="text-display" style={{
            fontSize: '1.4rem',
            margin: '0 0 0.5rem 0',
            color: '#fff',
            letterSpacing: '0.05em'
          }}>
            {window.location.pathname.startsWith('/en') ? 'SUGGESTION SENT!' : '¡SUGERENCIA ENVIADA!'}
          </h3>
          <p style={{
            margin: '0 0 1.5rem 0',
            color: 'rgba(255, 255, 255, 0.75)',
            fontSize: '0.9rem',
            lineHeight: 1.5
          }}>
            {t("suggestion_success")}
          </p>
          <button
            onClick={() => setSuggestionSuccess?.(false)}
            className="btn-hover-dark"
            style={{
              background: '#10b981',
              border: 'none',
              color: '#000',
              fontWeight: 900,
              fontSize: '0.9rem',
              padding: '0.75rem 2.25rem',
              borderRadius: '1rem',
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #000'
            }}
          >
            {window.location.pathname.startsWith('/en') ? 'OK' : 'ACEPTAR'}
          </button>
        </div>
      </Modal>
    </div>
  );
};
