import React, { useState } from 'react';
import { Activity } from 'lucide-react';

export default function LoginPage({ onLogin, isDemoMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: err } = await onLogin(email, password);
      if (err) setError(err.message || '로그인에 실패했습니다.');
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const { error: err } = await onLogin('demo@hani.kr', 'demo');
      if (err) setError(err.message || '데모 로그인에 실패했습니다.');
    } catch {
      setError('데모 로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500">
            <Activity size={32} color="white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">HANI MatchOS</h1>
          <p className="mt-2 text-sm text-slate-500">프리미엄 매칭 에이전시 CRM</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">이메일</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50 disabled:text-slate-400"
                placeholder="manager@agency.kr"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">비밀번호</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50 disabled:text-slate-400"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              데모 모드로 체험하기
            </button>
          </div>

          {isDemoMode && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
              Supabase가 설정되지 않아 데모 모드로 동작합니다. <code className="rounded bg-amber-100 px-1">.env</code>에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 설정하면 실제 DB로 전환됩니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
