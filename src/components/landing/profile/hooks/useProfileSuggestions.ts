import { useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ticketSchema, type TicketFormData } from '../../../../lib/schemas';

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
      const { error } = await supabase.from('tickets').insert({
        user_id: user.id,
        type: 'suggestion',
        subject: data.subject,
        message: data.message
      });

      if (error) throw error;
      setSuggestionSuccess(true);
      resetSuggestion();
      setTimeout(() => setSuggestionSuccess(false), 5000);
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
    suggestionError,
    registerSuggestion,
    handleSuggestionSubmit,
    suggestionErrors,
    onSuggestionSubmit,
    getValidationMessage
  };
};
