import { useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ticketSchema, type TicketFormData } from '../../../../lib/schemas';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const useProfileSuggestions = (user: any) => {
  const { t } = useTranslation();
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);
  const [suggestionSuccess, setSuggestionSuccess] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');

  const {
    register: registerSuggestion,
    handleSubmit: handleSuggestionSubmit,
    reset: resetSuggestion,
    formState: { errors: suggestionErrors }
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema)
  });

  const onSuggestionSubmit = async (data: TicketFormData) => {
    setIsSubmittingSuggestion(true);
    setSuggestionError('');
    setSuggestionSuccess(false);

    try {
      const isValidUuid = typeof user?.id === 'string' && UUID_REGEX.test(user.id);
      
      if (isValidUuid) {
        const { error } = await supabase.from('tickets').insert({
          user_id: user.id,
          type: 'suggestion',
          subject: data.subject,
          message: data.message
        });
        if (error) throw error;
      } else {
        // Fallback for guest/demo user ("local_player")
        try {
          const raw = localStorage.getItem('trucomundial_local_suggestions');
          const existing = raw ? JSON.parse(raw) : [];
          existing.push({
            id: 'sug_' + Date.now(),
            user_id: user?.id || 'local_player',
            type: 'suggestion',
            subject: data.subject,
            message: data.message,
            created_at: new Date().toISOString()
          });
          localStorage.setItem('trucomundial_local_suggestions', JSON.stringify(existing));
        } catch (storageErr) {
          console.warn('Could not save local suggestion', storageErr);
        }
      }

      setSuggestionSuccess(true);
      resetSuggestion();
    } catch (err: any) {
      setSuggestionError(t('error_sending_suggestion') + err.message);
    } finally {
      setIsSubmittingSuggestion(false);
    }
  };

  const getValidationMessage = (msg: string | undefined) => {
    if (!msg) return "";
    if (msg === "El asunto debe tener al menos 3 caracteres") return t("err_subject_min");
    if (msg === "El asunto es muy largo") return t("err_subject_max");
    if (msg === "El mensaje debe ser más descriptivo") return t("err_message_min");
    if (msg === "El mensaje es muy largo") return t("err_message_max");
    return t(msg);
  };

  return {
    isSubmittingSuggestion,
    suggestionSuccess,
    setSuggestionSuccess,
    suggestionError,
    registerSuggestion,
    handleSuggestionSubmit,
    suggestionErrors,
    onSuggestionSubmit,
    getValidationMessage
  };
};
