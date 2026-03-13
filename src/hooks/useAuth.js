import { useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import useAppStore from '../stores/appStore';

export function useAuth() {
  const { user, profile, setUser, setProfile } = useAppStore();
  const initialized = useRef(false);

  const fetchProfile = useCallback(async (userId) => {
    if (!isSupabaseConfigured()) return;
    const { data } = await supabase
      .from('users')
      .select('*, agencies(name, display_name)')
      .eq('id', userId)
      .single();
    if (data) {
      setProfile({
        ...data,
        agency_name: data.agencies?.display_name || data.agencies?.name,
      });
    }
  }, [setProfile]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (!isSupabaseConfigured()) {
      setUser({ id: 'demo', email: 'demo@hani.kr' });
      setProfile({ full_name: '이팀장', role: 'manager', agency_name: '압구정 노블레스 파트너스' });
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setProfile, fetchProfile]);

  const signIn = useCallback(async (email, password) => {
    if (!isSupabaseConfigured()) {
      setUser({ id: 'demo', email });
      setProfile({ full_name: '이팀장', role: 'manager', agency_name: '압구정 노블레스 파트너스' });
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, [setUser, setProfile]);

  const signUp = useCallback(async (email, password, fullName) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured' } };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setUser(null);
      setProfile(null);
      return;
    }
    await supabase.auth.signOut();
  }, [setUser, setProfile]);

  return {
    user,
    profile,
    isAuthenticated: !!user,
    isDemoMode: !isSupabaseConfigured(),
    signIn,
    signUp,
    signOut,
  };
}
