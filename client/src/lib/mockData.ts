import type {
  User,
  Task,
  TaskStatus,
  TaskPriority,
  Comment,
  ActivityLog,
  SubTask,
} from "./types";

export const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "김민준",
    email: "minjun@team.com",
    avatarColor: "#4F46E5",
    initials: "김민",
  },
  {
    id: "u2",
    name: "이서연",
    email: "seoyeon@team.com",
    avatarColor: "#0891B2",
    initials: "이서",
  },
  {
    id: "u3",
    name: "박지호",
    email: "jiho@team.com",
    avatarColor: "#059669",
    initials: "박지",
  },
  {
    id: "u4",
    name: "최유진",
    email: "yujin@team.com",
    avatarColor: "#D97706",
    initials: "최유",
  },
  {
    id: "u5",
    name: "정다은",
    email: "daeun@team.com",
    avatarColor: "#DC2626",
    initials: "정다",
  },
];

export const CURRENT_USER = MOCK_USERS[0];

const makeLog = (
  taskId: string,
  userId: string,
  actionType: string,
  description: string,
  createdAt: string,
  details?: { from?: string; to?: string }
): ActivityLog => ({
  id: `log-${taskId}-${actionType}-${createdAt}`,
  taskId,
  userId,
  actionType,
  description,
  details,
  createdAt,
});

const makeComment = (
  id: string,
  taskId: string,
  userId: string,
  type: Comment["type"],
  content: string,
  createdAt: string
): Comment => ({
  id,
  taskId,
  userId,
  type,
  content,
  createdAt,
  mentions: [],
});

const makeSub = (
  id: string,
  title: string,
  completed: boolean,
  assigneeId?: string
): SubTask => ({ id, title, completed, assigneeId });

export const MOCK_TASKS: Task[] = [
  // ─── IN_PROGRESS ───────────────────────────────────────────
  {
    id: "t1",
    title: "신규 대시보드 UI 설계 및 개발",
    description:
      "메인 대시보드의 KPI 위젯, 차트 컴포넌트, 레이아웃 리팩토링을 포함한 전체 UI 개편 작업입니다. Figma 시안 기반으로 React 컴포넌트를 구현합니다.",
    status: "IN_PROGRESS",
    priority: "HIGHEST",
    progress: 65,
    dueDate: "2026-06-28",
    startDate: "2026-06-15",
    assigneeId: "u1",
    creatorId: "u2",
    tags: ["Frontend", "UI/UX"],
    subTasks: [
      makeSub("s1-1", "Figma 시안 검토 및 컴포넌트 분류", true, "u1"),
      makeSub("s1-2", "KPI 위젯 컴포넌트 구현", true, "u1"),
      makeSub("s1-3", "차트 컴포넌트 (Recharts) 연동", false, "u1"),
      makeSub("s1-4", "반응형 레이아웃 적용", false, "u1"),
    ],
    comments: [
      makeComment(
        "c1-1",
        "t1",
        "u2",
        "COMMENT",
        "Figma 시안 v2 업로드했습니다. 색상 팔레트 변경 사항 확인 부탁드립니다 @김민준",
        "2026-06-16T09:30:00Z"
      ),
      makeComment(
        "c1-2",
        "t1",
        "u1",
        "NOTE",
        "차트 라이브러리는 Recharts로 확정. D3 마이그레이션은 다음 스프린트로 이월.",
        "2026-06-17T14:00:00Z"
      ),
      makeComment(
        "c1-3",
        "t1",
        "u3",
        "BLOCKER",
        "API 엔드포인트 /api/dashboard/stats 응답 스펙이 아직 미확정 상태입니다. 백엔드팀 확인 필요.",
        "2026-06-20T11:15:00Z"
      ),
    ],
    activityLog: [
      makeLog(
        "t1",
        "u2",
        "TASK_CREATED",
        "태스크를 생성했습니다.",
        "2026-06-15T09:00:00Z"
      ),
      makeLog(
        "t1",
        "u2",
        "ASSIGNEE_CHANGED",
        "담당자를 변경했습니다.",
        "2026-06-15T09:05:00Z",
        { from: "미배정", to: "김민준" }
      ),
      makeLog(
        "t1",
        "u1",
        "STATUS_CHANGED",
        "상태를 변경했습니다.",
        "2026-06-16T10:00:00Z",
        { from: "대기", to: "진행중" }
      ),
      makeLog(
        "t1",
        "u1",
        "SUBTASK_COMPLETED",
        "하위 작업을 완료했습니다: Figma 시안 검토",
        "2026-06-17T16:00:00Z"
      ),
    ],
    dependencies: [],
    createdAt: "2026-06-15T09:00:00Z",
    updatedAt: "2026-06-20T11:15:00Z",
  },
  {
    id: "t2",
    title: "사용자 인증 모듈 리팩토링",
    description:
      "기존 JWT 기반 인증 로직을 OAuth 2.0으로 전환하고, Refresh Token 로테이션 전략을 적용합니다.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    progress: 40,
    dueDate: "2026-07-05",
    startDate: "2026-06-18",
    assigneeId: "u3",
    creatorId: "u1",
    tags: ["Backend", "Security"],
    subTasks: [
      makeSub("s2-1", "OAuth 2.0 플로우 설계 문서 작성", true, "u3"),
      makeSub("s2-2", "Authorization Server 연동", false, "u3"),
      makeSub("s2-3", "Refresh Token 로테이션 구현", false, "u3"),
      makeSub("s2-4", "기존 세션 마이그레이션 스크립트", false, "u3"),
      makeSub("s2-5", "보안 테스트 및 침투 테스트", false, "u5"),
    ],
    comments: [
      makeComment(
        "c2-1",
        "t2",
        "u1",
        "QUESTION",
        "Refresh Token 만료 기간을 얼마로 설정할지 논의가 필요합니다. 현재 안은 14일인데 보안팀 의견은?",
        "2026-06-19T10:00:00Z"
      ),
    ],
    activityLog: [
      makeLog(
        "t2",
        "u1",
        "TASK_CREATED",
        "태스크를 생성했습니다.",
        "2026-06-18T09:00:00Z"
      ),
      makeLog(
        "t2",
        "u3",
        "STATUS_CHANGED",
        "상태를 변경했습니다.",
        "2026-06-18T14:00:00Z",
        { from: "대기", to: "진행중" }
      ),
    ],
    dependencies: [],
    createdAt: "2026-06-18T09:00:00Z",
    updatedAt: "2026-06-19T10:00:00Z",
  },
  // ─── TODO ───────────────────────────────────────────────────
  {
    id: "t3",
    title: "Q3 마케팅 캠페인 기획서 작성",
    description:
      "3분기 신제품 출시에 맞춘 통합 마케팅 캠페인 전략 수립. SNS, 이메일, 콘텐츠 마케팅 채널별 계획 포함.",
    status: "TODO",
    priority: "HIGH",
    progress: 0,
    dueDate: "2026-07-10",
    startDate: "2026-07-01",
    assigneeId: "u4",
    creatorId: "u4",
    tags: ["Marketing"],
    subTasks: [
      makeSub("s3-1", "경쟁사 캠페인 벤치마킹", false, "u4"),
      makeSub("s3-2", "채널별 예산 배분 계획", false, "u4"),
      makeSub("s3-3", "콘텐츠 캘린더 작성", false, "u2"),
    ],
    comments: [],
    activityLog: [
      makeLog(
        "t3",
        "u4",
        "TASK_CREATED",
        "태스크를 생성했습니다.",
        "2026-06-22T11:00:00Z"
      ),
    ],
    dependencies: [],
    createdAt: "2026-06-22T11:00:00Z",
    updatedAt: "2026-06-22T11:00:00Z",
  },
  {
    id: "t4",
    title: "데이터베이스 성능 최적화",
    description:
      "슬로우 쿼리 분석 및 인덱스 최적화. N+1 쿼리 문제 해결 및 쿼리 캐싱 전략 수립.",
    status: "TODO",
    priority: "MEDIUM",
    progress: 0,
    dueDate: "2026-07-15",
    startDate: "2026-07-07",
    assigneeId: "u3",
    creatorId: "u1",
    tags: ["Backend", "Performance"],
    subTasks: [
      makeSub("s4-1", "슬로우 쿼리 로그 분석", false, "u3"),
      makeSub("s4-2", "복합 인덱스 설계 및 적용", false, "u3"),
      makeSub("s4-3", "Redis 캐싱 레이어 추가", false, "u3"),
    ],
    comments: [],
    activityLog: [
      makeLog(
        "t4",
        "u1",
        "TASK_CREATED",
        "태스크를 생성했습니다.",
        "2026-06-21T15:00:00Z"
      ),
    ],
    dependencies: [{ predecessorId: "t2", successorId: "t4" }],
    createdAt: "2026-06-21T15:00:00Z",
    updatedAt: "2026-06-21T15:00:00Z",
  },
  {
    id: "t5",
    title: "신규 입사자 온보딩 자료 업데이트",
    description:
      "최신 개발 환경 설정 가이드, 팀 컨벤션 문서, 코드 리뷰 프로세스 문서를 최신화합니다.",
    status: "TODO",
    priority: "LOW",
    progress: 0,
    dueDate: "2026-07-20",
    startDate: "2026-07-14",
    assigneeId: "u2",
    creatorId: "u2",
    tags: ["Documentation"],
    subTasks: [],
    comments: [],
    activityLog: [
      makeLog(
        "t5",
        "u2",
        "TASK_CREATED",
        "태스크를 생성했습니다.",
        "2026-06-23T09:00:00Z"
      ),
    ],
    dependencies: [],
    createdAt: "2026-06-23T09:00:00Z",
    updatedAt: "2026-06-23T09:00:00Z",
  },
  // ─── REVIEW ─────────────────────────────────────────────────
  {
    id: "t6",
    title: "결제 모듈 QA 테스트",
    description:
      "신규 PG사 연동 후 결제 플로우 전체 시나리오 테스트. 정상 결제, 실패, 취소, 환불 케이스 포함.",
    status: "REVIEW",
    priority: "HIGHEST",
    progress: 80,
    dueDate: "2026-06-25",
    startDate: "2026-06-20",
    assigneeId: "u5",
    creatorId: "u1",
    tags: ["QA", "Payment"],
    subTasks: [
      makeSub("s6-1", "정상 결제 시나리오 테스트", true, "u5"),
      makeSub("s6-2", "결제 실패 케이스 테스트", true, "u5"),
      makeSub("s6-3", "취소/환불 플로우 테스트", true, "u5"),
      makeSub("s6-4", "크로스 브라우저 테스트", false, "u5"),
      makeSub("s6-5", "테스트 결과 보고서 작성", false, "u5"),
    ],
    comments: [
      makeComment(
        "c6-1",
        "t6",
        "u5",
        "BLOCKER",
        "Safari에서 결제 팝업이 차단되는 이슈 발견. 개발팀 확인 필요합니다.",
        "2026-06-22T16:30:00Z"
      ),
      makeComment(
        "c6-2",
        "t6",
        "u1",
        "COMMENT",
        "Safari 팝업 차단 이슈는 window.open 대신 redirect 방식으로 수정 예정. 내일 배포 후 재테스트 요청드립니다.",
        "2026-06-22T17:00:00Z"
      ),
    ],
    activityLog: [
      makeLog(
        "t6",
        "u1",
        "TASK_CREATED",
        "태스크를 생성했습니다.",
        "2026-06-20T09:00:00Z"
      ),
      makeLog(
        "t6",
        "u5",
        "STATUS_CHANGED",
        "상태를 변경했습니다.",
        "2026-06-20T10:00:00Z",
        { from: "진행중", to: "검토/QA" }
      ),
    ],
    dependencies: [],
    createdAt: "2026-06-20T09:00:00Z",
    updatedAt: "2026-06-22T17:00:00Z",
  },
  {
    id: "t7",
    title: "API 문서화 (Swagger/OpenAPI)",
    description:
      "전체 REST API 엔드포인트에 대한 OpenAPI 3.0 스펙 문서 작성 및 Swagger UI 배포.",
    status: "REVIEW",
    priority: "MEDIUM",
    progress: 90,
    dueDate: "2026-06-26",
    startDate: "2026-06-17",
    assigneeId: "u3",
    creatorId: "u3",
    tags: ["Documentation", "Backend"],
    subTasks: [
      makeSub("s7-1", "인증 API 문서화", true, "u3"),
      makeSub("s7-2", "사용자 API 문서화", true, "u3"),
      makeSub("s7-3", "결제 API 문서화", true, "u3"),
      makeSub("s7-4", "Swagger UI 스테이징 배포", false, "u3"),
    ],
    comments: [],
    activityLog: [
      makeLog(
        "t7",
        "u3",
        "TASK_CREATED",
        "태스크를 생성했습니다.",
        "2026-06-17T09:00:00Z"
      ),
      makeLog(
        "t7",
        "u3",
        "STATUS_CHANGED",
        "상태를 변경했습니다.",
        "2026-06-22T09:00:00Z",
        { from: "진행중", to: "검토/QA" }
      ),
    ],
    dependencies: [],
    createdAt: "2026-06-17T09:00:00Z",
    updatedAt: "2026-06-22T09:00:00Z",
  },
  // ─── DONE ───────────────────────────────────────────────────
  {
    id: "t8",
    title: "CI/CD 파이프라인 구축",
    description:
      "GitHub Actions 기반 자동화 배포 파이프라인 구축. 테스트 → 빌드 → 스테이징 → 프로덕션 단계별 자동화.",
    status: "DONE",
    priority: "HIGH",
    progress: 100,
    dueDate: "2026-06-20",
    startDate: "2026-06-10",
    assigneeId: "u1",
    creatorId: "u1",
    tags: ["DevOps", "Infrastructure"],
    subTasks: [
      makeSub("s8-1", "GitHub Actions 워크플로우 작성", true, "u1"),
      makeSub("s8-2", "스테이징 환경 배포 자동화", true, "u1"),
      makeSub("s8-3", "프로덕션 배포 승인 게이트 설정", true, "u1"),
      makeSub("s8-4", "슬랙 알림 연동", true, "u1"),
    ],
    comments: [
      makeComment(
        "c8-1",
        "t8",
        "u1",
        "NOTE",
        "파이프라인 구축 완료. 평균 배포 시간 12분 → 4분으로 단축.",
        "2026-06-20T15:00:00Z"
      ),
    ],
    activityLog: [
      makeLog(
        "t8",
        "u1",
        "TASK_CREATED",
        "태스크를 생성했습니다.",
        "2026-06-10T09:00:00Z"
      ),
      makeLog(
        "t8",
        "u1",
        "STATUS_CHANGED",
        "상태를 변경했습니다.",
        "2026-06-20T15:00:00Z",
        { from: "검토/QA", to: "완료" }
      ),
    ],
    dependencies: [],
    createdAt: "2026-06-10T09:00:00Z",
    updatedAt: "2026-06-20T15:00:00Z",
  },
  {
    id: "t9",
    title: "디자인 시스템 컴포넌트 라이브러리 구축",
    description:
      "Storybook 기반 공통 UI 컴포넌트 라이브러리 구축. Button, Input, Modal, Table 등 30개 컴포넌트.",
    status: "DONE",
    priority: "HIGH",
    progress: 100,
    dueDate: "2026-06-18",
    startDate: "2026-06-01",
    assigneeId: "u2",
    creatorId: "u2",
    tags: ["Frontend", "Design System"],
    subTasks: [
      makeSub("s9-1", "컴포넌트 목록 및 스펙 정의", true, "u2"),
      makeSub("s9-2", "기본 컴포넌트 30종 구현", true, "u2"),
      makeSub("s9-3", "Storybook 문서화", true, "u2"),
      makeSub("s9-4", "npm 패키지 배포", true, "u2"),
    ],
    comments: [],
    activityLog: [
      makeLog(
        "t9",
        "u2",
        "TASK_CREATED",
        "태스크를 생성했습니다.",
        "2026-06-01T09:00:00Z"
      ),
      makeLog(
        "t9",
        "u2",
        "STATUS_CHANGED",
        "상태를 변경했습니다.",
        "2026-06-18T17:00:00Z",
        { from: "검토/QA", to: "완료" }
      ),
    ],
    dependencies: [],
    createdAt: "2026-06-01T09:00:00Z",
    updatedAt: "2026-06-18T17:00:00Z",
  },
  // ─── HOLD ───────────────────────────────────────────────────
  {
    id: "t10",
    title: "모바일 앱 개발 (React Native)",
    description:
      "웹 서비스의 모바일 버전 개발. iOS/Android 동시 지원. 핵심 기능 우선 구현 후 점진적 확장.",
    status: "HOLD",
    priority: "MEDIUM",
    progress: 15,
    dueDate: "2026-09-30",
    startDate: "2026-08-01",
    assigneeId: "u1",
    creatorId: "u1",
    tags: ["Mobile", "React Native"],
    subTasks: [
      makeSub("s10-1", "React Native 환경 설정", true, "u1"),
      makeSub("s10-2", "네비게이션 구조 설계", false, "u1"),
      makeSub("s10-3", "인증 화면 구현", false, "u1"),
    ],
    comments: [
      makeComment(
        "c10-1",
        "t10",
        "u1",
        "NOTE",
        "예산 재검토로 인해 Q3까지 보류. 웹 서비스 안정화 후 재개 예정.",
        "2026-06-15T10:00:00Z"
      ),
    ],
    activityLog: [
      makeLog(
        "t10",
        "u1",
        "TASK_CREATED",
        "태스크를 생성했습니다.",
        "2026-06-10T09:00:00Z"
      ),
      makeLog(
        "t10",
        "u1",
        "STATUS_CHANGED",
        "상태를 변경했습니다.",
        "2026-06-15T10:00:00Z",
        { from: "진행중", to: "보류" }
      ),
    ],
    dependencies: [],
    createdAt: "2026-06-10T09:00:00Z",
    updatedAt: "2026-06-15T10:00:00Z",
  },
];

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  TODO: {
    label: "대기",
    color: "#64748B",
    bg: "#F1F5F9",
    border: "#CBD5E1",
  },
  IN_PROGRESS: {
    label: "진행중",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  REVIEW: {
    label: "검토/QA",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  DONE: {
    label: "완료",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
  },
  HOLD: {
    label: "보류",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
  },
};

export const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; bg: string; icon: string }
> = {
  HIGHEST: { label: "긴급", color: "#DC2626", bg: "#FEF2F2", icon: "⚡" },
  HIGH: { label: "높음", color: "#EA580C", bg: "#FFF7ED", icon: "↑" },
  MEDIUM: { label: "보통", color: "#D97706", bg: "#FFFBEB", icon: "→" },
  LOW: { label: "낮음", color: "#64748B", bg: "#F8FAFC", icon: "↓" },
};

export const ISSUE_TYPE_CONFIG: Record<
  Comment["type"],
  { label: string; color: string; bg: string }
> = {
  COMMENT: { label: "댓글", color: "#4F46E5", bg: "#EEF2FF" },
  BLOCKER: { label: "블로커", color: "#DC2626", bg: "#FEF2F2" },
  QUESTION: { label: "문의", color: "#0891B2", bg: "#ECFEFF" },
  NOTE: { label: "메모", color: "#059669", bg: "#ECFDF5" },
};
