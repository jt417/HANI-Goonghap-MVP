# HANI MatchOS — 프로토타입 → 실사용 CRM 전환 계획서

## 1. 현재 상태 분석 (As-Is)

### 1.1 프로토타입 구조
- **단일 파일**: `hani_matchos_refactor.jsx` (2,160줄)
- **기술 스택**: React + Tailwind CSS + Lucide Icons
- **라우팅**: 없음 (useState 탭 전환)
- **백엔드**: 없음
- **DB**: 없음 (하드코딩된 목업 데이터)
- **인증**: 없음 (화면에 "이팀장" 고정 텍스트)

### 1.2 구현된 UI 화면 (8개 탭 + 2개 모달)

| 화면 | 컴포넌트 | 현재 상태 |
|------|----------|-----------|
| 대시보드 | `Dashboard` | 통계 카드 6개, 업무 큐, 알림, KPI 차트, 타임라인 — **모두 하드코딩** |
| 우리 회원 CRM | `MyMembers` | 회원 3명 목록 + 상세 패널 — **선택만 동작, CRUD 없음** |
| 협업 네트워크 탐색 | `NetworkView` | 익명 후보 4명 + 필터 + 비교함 — **필터 동작, 나머지 목업** |
| 받은 제안함 | `InboxView` | 3건 테이블 + 상세 패널 — **선택만 동작, 워크플로 없음** |
| 보낸 제안함 | `OutboxView` | 3건 테이블 + 상세 패널 — **위와 동일** |
| 인증센터 | `VerifyView` | 3건 테이블 — **버튼 미작동** |
| 정산관리 | `SettlementView` | 3건 테이블 — **버튼 미작동** |
| 분쟁관리 | `DisputeView` | 3건 테이블 — **버튼 미작동** |
| 회원 등록 모달 | `MemberRegistrationModal` | 폼 + 실시간 점수 산정 — **유일하게 부분 동작 (state 추가)** |
| 소개 제안 모달 | `ProposalModal` | 제안서 작성 UI — **버튼 미작동** |

### 1.3 실제 CRM이 되려면 필요한 것

| 영역 | 현재 | 필요 |
|------|------|------|
| 데이터 저장 | 메모리 (새로고침 시 소멸) | 영구 DB |
| 인증/권한 | 없음 | 로그인 + 역할별 접근제어 |
| 회원 관리 | 3명 하드코딩 | 전체 CRUD + 검색/필터/페이지네이션 |
| 제안 워크플로 | 버튼만 존재 | 상태 전이 + 알림 + 이력 |
| 메시징 | 3개 하드코딩 메시지 | 실시간 채팅 |
| 파일 업로드 | 없음 | 인증 서류 업로드/관리 |
| 알림 | 하드코딩 텍스트 | 실시간 푸시 알림 |
| 코드 구조 | 단일 파일 2,160줄 | 컴포넌트 분리 + 라우팅 |

---

## 2. 기술 스택 선정

### 2.1 프론트엔드 (기존 유지 + 확장)

| 기술 | 용도 | 이유 |
|------|------|------|
| **React 18** | UI 프레임워크 | 기존 코드 호환 |
| **Vite** | 빌드 도구 | 이미 설정됨 |
| **Tailwind CSS v3** | 스타일링 | 기존 코드 호환 |
| **React Router v6** | 라우팅 | 탭 → URL 전환 |
| **TanStack Query v5** | 서버 상태 관리 | 캐싱, 무효화, 로딩 상태 |
| **Zustand** | 클라이언트 상태 | 가벼운 전역 상태 (비교함, 설정 등) |
| **React Hook Form + Zod** | 폼 관리/검증 | 회원 등록, 제안서 등 복잡한 폼 |

### 2.2 백엔드 — Supabase (BaaS)

| 기능 | Supabase 제공 | 비고 |
|------|---------------|------|
| **PostgreSQL DB** | 내장 | 관계형 데이터, RLS 정책 |
| **Authentication** | 내장 | 이메일/비밀번호, 매직링크 |
| **Row Level Security** | 내장 | 테넌트(업체) 간 데이터 격리 |
| **Storage** | 내장 | 인증 서류 파일 업로드 |
| **Realtime** | 내장 | 메시지, 알림 실시간 구독 |
| **Edge Functions** | 내장 | 점수 산정, 워크플로 로직 |

**Supabase 선정 이유**: MVP에서 별도 서버 구축 없이 인증·DB·스토리지·실시간을 한번에 해결. 프리 티어로 충분히 시작 가능.

### 2.3 배포

| 항목 | 선택 |
|------|------|
| 프론트엔드 | **Vercel** (이미 연결됨) |
| 백엔드 | **Supabase Cloud** (프리 티어) |
| 도메인 | Vercel 기본 → 추후 커스텀 도메인 |

---

## 3. 데이터베이스 설계

### 3.1 핵심 테이블

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   agencies       │     │   users          │     │   members        │
│ (업체/테넌트)     │────│ (매니저/직원)     │────│ (회원)           │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK, auth)   │     │ id (PK)         │
│ name            │     │ agency_id (FK)  │     │ agency_id (FK)  │
│ display_name    │     │ email           │     │ name            │
│ tier            │     │ full_name       │     │ birth_date      │
│ trust_score     │     │ role            │     │ gender          │
│ response_rate   │     │ created_at      │     │ job / income    │
│ created_at      │     │                 │     │ height / weight │
└─────────────────┘     └─────────────────┘     │ body_type       │
                                                 │ assets / family │
                                                 │ appearance_note │
                                                 │ location        │
                                                 │ verify_level    │
                                                 │ verify_items[]  │
                                                 │ saju_profile    │
                                                 │ grade (JSONB)   │
                                                 │ values[]        │
                                                 │ status          │
                                                 │ manager_id (FK) │
                                                 │ profile_completion│
                                                 │ created_at      │
                                                 └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   proposals      │     │   messages       │     │   verifications  │
│ (소개 제안)       │     │ (메시지)         │     │ (인증)           │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ from_agency_id  │     │ proposal_id(FK) │     │ member_id (FK)  │
│ to_agency_id    │     │ sender_id (FK)  │     │ type (본인/재직..)│
│ from_member_id  │     │ text            │     │ status          │
│ to_member_id    │     │ created_at      │     │ assignee_id(FK) │
│ match_score     │     └─────────────────┘     │ due_date        │
│ status          │                              │ file_urls[]     │
│ visibility[]    │     ┌─────────────────┐     │ notes           │
│ memo            │     │   settlements    │     │ created_at      │
│ workflow_step   │     │ (정산)           │     └─────────────────┘
│ owner_id (FK)   │     ├─────────────────┤
│ created_at      │     │ id (PK)         │     ┌─────────────────┐
│ updated_at      │     │ proposal_id(FK) │     │   disputes       │
└─────────────────┘     │ partner_agency  │     │ (분쟁)           │
                        │ pair_desc       │     ├─────────────────┤
                        │ stage           │     │ id (PK)         │
                        │ amount          │     │ partner_agency  │
                        │ split_ratio     │     │ issue           │
                        │ due_date        │     │ level           │
                        │ status          │     │ assignee_id(FK) │
                        │ created_at      │     │ notes           │
                        └─────────────────┘     │ created_at      │
                                                 │ updated_at      │
┌─────────────────┐                              └─────────────────┘
│   score_rules    │
│ (점수 가중치)     │
├─────────────────┤
│ id (PK)         │
│ agency_id (FK)  │
│ weights (JSONB) │
│ badge_thresholds│
│ updated_at      │
└─────────────────┘

┌─────────────────┐
│   activity_log   │
│ (활동 로그)       │
├─────────────────┤
│ id (PK)         │
│ agency_id (FK)  │
│ actor_id (FK)   │
│ action_type     │
│ target_type     │
│ target_id       │
│ metadata (JSONB)│
│ created_at      │
└─────────────────┘
```

### 3.2 Row Level Security (RLS) 정책

```sql
-- 핵심 원칙: 각 업체는 자기 데이터만 접근
-- members: agency_id = auth.user().agency_id
-- proposals: from_agency_id 또는 to_agency_id = 내 업체
-- network 탐색: 타사 회원은 익명 필드만 노출 (DB function으로 마스킹)
```

---

## 4. 구현 단계 (Phase별)

### Phase 0: 프로젝트 구조 재편 (1~2일)

**목표**: 2,160줄 단일 파일을 유지보수 가능한 구조로 분리

```
src/
├── main.jsx                    # 진입점
├── App.jsx                     # 라우터 + 레이아웃
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx         # 사이드바 네비게이션
│   │   ├── Header.jsx          # 상단 헤더
│   │   └── AppShell.jsx        # 전체 레이아웃 (Sidebar + Header + main)
│   ├── common/
│   │   ├── Badge.jsx           # 인증 배지
│   │   ├── GradeBadge.jsx      # 등급 배지
│   │   ├── StatusChip.jsx      # 상태 칩
│   │   ├── SectionCard.jsx     # 섹션 카드
│   │   ├── TableList.jsx       # 범용 테이블
│   │   ├── DetailField.jsx     # 상세 필드
│   │   └── InfoTooltip.jsx     # 정보 툴팁
│   ├── grade/
│   │   ├── GradeScoreCard.jsx  # 점수 카드
│   │   └── GradeTabView.jsx    # 탭별 점수 상세
│   ├── proposal/
│   │   ├── WorkflowStepper.jsx # 진행 단계
│   │   ├── ProposalDetailPanel.jsx
│   │   └── ProposalModal.jsx   # 제안서 모달
│   └── member/
│       ├── MemberRegistrationModal.jsx
│       └── NetworkResultCard.jsx
├── pages/
│   ├── DashboardPage.jsx
│   ├── MyMembersPage.jsx
│   ├── NetworkPage.jsx
│   ├── InboxPage.jsx
│   ├── OutboxPage.jsx
│   ├── VerifyPage.jsx
│   ├── SettlementPage.jsx
│   ├── DisputePage.jsx
│   └── LoginPage.jsx
├── hooks/
│   ├── useMembers.js           # 회원 CRUD 쿼리
│   ├── useProposals.js         # 제안 쿼리
│   ├── useAuth.js              # 인증 훅
│   └── useScoring.js           # 점수 산정 로직
├── lib/
│   ├── supabase.js             # Supabase 클라이언트
│   ├── scoring.js              # 점수 산정 알고리즘 (기존 scoreMember 추출)
│   └── constants.js            # 상수 (statusToneMap, toneClasses 등)
├── stores/
│   └── appStore.js             # Zustand 전역 상태
└── styles/
    └── index.css               # Tailwind 진입점
```

**작업 내용**:
- [ ] 기존 JSX에서 컴포넌트 단위로 분리
- [ ] React Router 설정 (탭 → URL 경로)
- [ ] 상수/유틸리티 함수 추출
- [ ] 빌드 확인 (기존 UI 동일하게 동작)

---

### Phase 1: 인증 & 테넌트 (2~3일)

**목표**: Supabase 연동, 로그인/로그아웃, 업체별 데이터 격리

**작업 내용**:
- [ ] Supabase 프로젝트 생성
- [ ] DB 스키마 마이그레이션 (agencies, users 테이블)
- [ ] RLS 정책 설정
- [ ] 로그인 페이지 (`/login`)
- [ ] Auth Guard (비인증 사용자 리디렉트)
- [ ] 상단 헤더에 실제 사용자 정보 표시
- [ ] 역할별 사이드바 메뉴 제어 (매니저 vs 관리자 vs 인증팀)

**인증 흐름**:
```
이메일/비밀번호 로그인 → Supabase Auth → JWT
→ users 테이블에서 agency_id, role 조회
→ 전역 상태에 저장 → RLS가 데이터 필터링
```

---

### Phase 2: 회원 CRM — CRUD (3~4일)

**목표**: 회원 등록/조회/수정/삭제 + 검색 + 자동 점수 산정

**작업 내용**:
- [ ] members 테이블 마이그레이션
- [ ] score_rules 테이블 마이그레이션
- [ ] 회원 목록 API + 무한 스크롤 or 페이지네이션
- [ ] 검색/필터 (이름, 상태, 검증 레벨, 점수 범위)
- [ ] 신규 회원 등록 (기존 모달 → DB 저장)
- [ ] 회원 상세 수정 (인라인 편집 or 수정 모달)
- [ ] 회원 삭제 (소프트 삭제)
- [ ] 점수 산정 엔진 (기존 `scoreMember` 함수 → Supabase Edge Function)
- [ ] 관리자 가중치/배지 설정 (score_rules 테이블 연동)
- [ ] 프로필 완성도 자동 계산

**점수 산정 흐름**:
```
회원 등록/수정 → Edge Function 트리거
→ score_rules에서 가중치 조회
→ 카테고리별 점수 계산 → grade JSONB 업데이트
→ 배지 자동 부여
```

---

### Phase 3: 제안 워크플로 (3~4일)

**목표**: 받은/보낸 제안함 실제 동작 + 상태 전이 + 메시징

**작업 내용**:
- [ ] proposals 테이블 마이그레이션
- [ ] messages 테이블 마이그레이션
- [ ] 소개 제안 생성 (ProposalModal → DB 저장)
- [ ] 제안 상태 전이: `검토중 → 추가정보요청 → 회원확인 → 수락/거절`
- [ ] 워크플로 스테퍼 실제 DB 상태 연동
- [ ] 메시지 스레드 CRUD (proposal_id 기준)
- [ ] Supabase Realtime 구독 (새 메시지/상태 변경 즉시 반영)
- [ ] 1차 공개 범위 설정 저장 (visibility 배열)
- [ ] 받은 제안 처리 (수락/추가정보요청/거절 버튼 동작)

**제안 상태 머신**:
```
[생성] → 검토중 → 추가정보 요청 ↔ 응답대기
                 → 회원 확인중 → 수락 → 소개 확정
                                → 거절
```

---

### Phase 4: 네트워크 탐색 (2~3일)

**목표**: 타사 회원 익명 탐색, 비교함, 매칭 점수 기반 추천

**작업 내용**:
- [ ] 네트워크 조회 API (타사 회원 → 익명 카드 변환)
- [ ] DB Function: 실명/연락처 마스킹, 범위형 정보만 노출
- [ ] 매칭 점수 계산 (조건 적합도 + 가치관 + 궁합 + 성사 가능성)
- [ ] 필터링 (최소 점수, 검증 레벨, 지역, 직군 등)
- [ ] 비교함 기능 (최대 3명, Zustand 로컬 상태)
- [ ] 비교 테이블 렌더링

---

### Phase 5: 인증센터 + 파일 업로드 (2~3일)

**목표**: 서류 인증 워크플로 + 파일 관리

**작업 내용**:
- [ ] verifications 테이블 마이그레이션
- [ ] Supabase Storage 버킷 설정 (`verification-docs`, private)
- [ ] 파일 업로드 UI (드래그앤드롭 or 파일 선택)
- [ ] 인증 큐 관리 (대기 → 검토중 → 보완요청 ↔ 승인/반려)
- [ ] 인증 레벨 자동 갱신 (승인 시 verify_level 업데이트)
- [ ] 만료 재검증 알림

---

### Phase 6: 정산 & 분쟁 (2~3일)

**목표**: 정산 추적 + 분쟁 기록/중재

**작업 내용**:
- [ ] settlements 테이블 마이그레이션
- [ ] disputes 테이블 마이그레이션
- [ ] 정산 생성 (성사 확정 시 자동 or 수동)
- [ ] 정산 상태 관리 (예정 → 검수 → 확정 → 지급완료)
- [ ] 배분 비율 조정
- [ ] 분쟁 등록/중재 기록/증빙 첨부/해결 처리

---

### Phase 7: 대시보드 & 알림 (2~3일)

**목표**: 실시간 통계 + 알림 시스템

**작업 내용**:
- [ ] activity_log 테이블 마이그레이션
- [ ] 대시보드 통계 API (DB 집계 쿼리)
- [ ] 업무 큐 자동 생성 (미응답 7일, 인증 만료 등)
- [ ] 실시간 타임라인 (Supabase Realtime)
- [ ] KPI 차트 데이터 연동
- [ ] 알림 시스템 (인앱 알림 + 향후 이메일)
- [ ] 업체 평판 지표 계산

---

### Phase 8: 배포 & 마무리 (1~2일)

**목표**: 프로덕션 배포 준비

**작업 내용**:
- [ ] 환경변수 설정 (Supabase URL/Key)
- [ ] Vercel 프로덕션 배포
- [ ] 에러 바운더리 + 로딩 스켈레톤
- [ ] 반응형 모바일 대응 (태블릿 최소 지원)
- [ ] 시드 데이터 (기존 목업 데이터 → DB 초기 데이터)

---

## 5. 일정 요약

| Phase | 내용 | 예상 기간 | 누적 |
|-------|------|----------|------|
| 0 | 프로젝트 구조 재편 | 1~2일 | 2일 |
| 1 | 인증 & 테넌트 | 2~3일 | 5일 |
| 2 | 회원 CRM CRUD | 3~4일 | 9일 |
| 3 | 제안 워크플로 | 3~4일 | 13일 |
| 4 | 네트워크 탐색 | 2~3일 | 16일 |
| 5 | 인증센터 + 파일 | 2~3일 | 19일 |
| 6 | 정산 & 분쟁 | 2~3일 | 22일 |
| 7 | 대시보드 & 알림 | 2~3일 | 25일 |
| 8 | 배포 & 마무리 | 1~2일 | **~27일** |

**총 예상: 약 4주 (풀타임 기준)**

---

## 6. MVP 우선순위 (최소 출시 가능 범위)

모든 Phase를 한번에 구현할 필요 없음. **최소 출시 가능 버전(MVP)**:

### Must-Have (Phase 0 + 1 + 2 + 3)
- 프로젝트 구조 분리
- 로그인/인증
- 회원 CRUD + 자동 점수 산정
- 제안 워크플로 (보내기/받기/상태관리)
- 메시징

→ **약 2주면 핵심 CRM 기능 사용 가능**

### Should-Have (Phase 4 + 5)
- 네트워크 탐색
- 인증센터 + 파일 업로드

### Nice-to-Have (Phase 6 + 7 + 8)
- 정산/분쟁 관리
- 실시간 대시보드
- 모바일 대응

---

## 7. 리스크 & 고려사항

| 리스크 | 대응 |
|--------|------|
| Supabase 프리 티어 제한 (500MB DB, 1GB 스토리지) | 초기 MVP 충분. 유료 전환 시 $25/월 |
| 멀티 테넌트 데이터 유출 | RLS 정책 + 서버사이드 마스킹 철저 검증 |
| 단일 파일 리팩토링 시 회귀 버그 | Phase 0에서 기존 UI 동일 동작 확인 후 진행 |
| 사주 엔진 연동 | 현재 프로토타입의 `saju.profile`은 텍스트만. 추후 HANI 사주 엔진과 API 연동 가능 |
| 실시간 메시징 스케일 | Supabase Realtime 무료 200 동시 연결. MVP 충분 |

---

## 8. 다음 액션

Phase 0부터 시작하려면 "Phase 0 진행해라"라고 지시해주세요.
특정 Phase만 먼저 하고 싶으면 해당 Phase 번호를 알려주세요.
