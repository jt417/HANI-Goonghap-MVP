import React, { useState } from 'react';
import { Activity, Users, Shield, User } from 'lucide-react';

const ROLE_OPTIONS = [
  {
    role: 'manager',
    label: '매칭매니저',
    desc: '회원 관리, 매칭 검색, 소개 제안',
    icon: Users,
    color: 'violet',
    email: 'manager@hani.kr',
  },
  {
    role: 'individual',
    label: '개인회원',
    desc: '프로필 등록, 소개 제안 받기',
    icon: User,
    color: 'rose',
    email: 'user@hani.kr',
  },
  {
    role: 'admin',
    label: '관리자',
    desc: '전체 시스템 관리, 업체 관리',
    icon: Shield,
    color: 'slate',
    email: 'admin@hani.kr',
  },
];

const colorMap = {
  violet: {
    bg: 'bg-violet-50 hover:bg-violet-100 border-violet-200 hover:border-violet-300',
    icon: 'bg-violet-500',
    text: 'text-violet-700',
  },
  rose: {
    bg: 'bg-rose-50 hover:bg-rose-100 border-rose-200 hover:border-rose-300',
    icon: 'bg-rose-500',
    text: 'text-rose-700',
  },
  slate: {
    bg: 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300',
    icon: 'bg-slate-700',
    text: 'text-slate-700',
  },
};

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

  const handleDemoLogin = async (role) => {
    setLoading(true);
    try {
      const opt = ROLE_OPTIONS.find((r) => r.role === role);
      const { error: err } = await onLogin(opt?.email || 'demo@hani.kr', 'demo', role);
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
          <p className="mt-2 text-sm text-slate-500">프리미엄 매칭 에이전시 플랫폼</p>
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

          {/* Demo mode role selection */}
          <div className="mt-5 border-t border-slate-200 pt-5">
            <div className="mb-3 text-center text-xs font-medium text-slate-400">데모 모드로 체험하기</div>
            <div className="space-y-2">
              {ROLE_OPTIONS.map(({ role, label, desc, icon: Icon, color }) => {
                const c = colorMap[color];
                return (
                  <button
                    key={role}
                    onClick={() => handleDemoLogin(role)}
                    disabled={loading}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition disabled:opacity-50 ${c.bg}`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white ${c.icon}`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-bold ${c.text}`}>{label}</div>
                      <div className="text-xs text-slate-500">{desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
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
