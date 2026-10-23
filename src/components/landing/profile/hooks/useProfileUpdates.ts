import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useTranslation } from 'react-i18next';
import type { User } from '@supabase/supabase-js';
import { updateLocalUser } from '../../../../lib/localAuth';

export const useProfileUpdates = (user: User | null) => {
  const { t } = useTranslation();

  // Name edit states
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.user_metadata?.custom_username || user?.email?.split('@')[0] || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Nationality state
  const [nationality, setNationality] = useState(user?.user_metadata?.nationality || '');
  const [isUpdatingNationality, setIsUpdatingNationality] = useState(false);
  const [isNatDropdownOpen, setIsNatDropdownOpen] = useState(false);
  const [natSearch, setNatSearch] = useState('');

  useEffect(() => {
    setNationality(user?.user_metadata?.nationality || '');
    setNewName(user?.user_metadata?.custom_username || user?.email?.split('@')[0] || '');
  }, [user]);

  const handleUpdateNationality = async (newNat: string) => {
    setNationality(newNat);
    setIsUpdatingNationality(true);
    updateLocalUser({ nationality: newNat });
    try {
      await supabase.auth.updateUser({
        data: { nationality: newNat }
      });
      
      // Sync with profiles table
      if (user?.id) {
        const { data } = await supabase
          .from("profiles")
          .update({ nationality: newNat })
          .eq("id", user.id)
          .select();

        if (!data || data.length === 0) {
          await supabase.from("profiles").upsert({ 
            id: user.id, 
            nationality: newNat,
            username: user?.user_metadata?.custom_username || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Usuario',
            email: user?.email
          }, { onConflict: 'id' });
        }
      }
    } catch (e) {
      console.error('Error updating nationality', e);
    } finally {
      setIsUpdatingNationality(false);
      setIsNatDropdownOpen(false);
    }
  };

  // 24h check
  const lastChangeStr = user?.user_metadata?.last_name_change;
  const lastChangeDate = lastChangeStr ? new Date(lastChangeStr) : null;
  const canChangeName = !lastChangeDate || (new Date().getTime() - lastChangeDate.getTime() > 72 * 60 * 60 * 1000);

  const handleUpdateName = async () => {
    if (!newName.trim() || newName.trim() === (user?.user_metadata?.custom_username || user?.email?.split('@')[0])) {
      setEditingName(false);
      return;
    }
    
    if (!canChangeName) {
      setUpdateError(t('config_username_error'));
      return;
    }
    
    setIsUpdatingName(true);
    setUpdateError('');
    
    try {
      const changedAt = new Date().toISOString();
      updateLocalUser({
        custom_username: newName.trim(),
        name: newName.trim(),
        full_name: newName.trim(),
        last_name_change: changedAt
      });

      const { error } = await supabase.auth.updateUser({
        data: { 
          custom_username: newName.trim(),
          last_name_change: changedAt
        }
      });
      
      if (error) console.warn("Supabase update error (operating locally):", error);

      // Sync with profiles table so other users see the updated username
      if (user?.id) {
        await supabase
          .from("profiles")
          .update({ username: newName.trim() })
          .eq("id", user.id);
      }
      
      setEditingName(false);
    } catch (err) {
      console.warn("Error updating user name:", err);
      // In local mode, still accept the name update
      setEditingName(false);
    } finally {
      setIsUpdatingName(false);
    }
  };

  return {
    editingName,
    setEditingName,
    newName,
    setNewName,
    isUpdatingName,
    updateError,
    setUpdateError,
    handleUpdateName,
    canChangeName,
    
    nationality,
    isUpdatingNationality,
    isNatDropdownOpen,
    setIsNatDropdownOpen,
    natSearch,
    setNatSearch,
    handleUpdateNationality
  };
};
