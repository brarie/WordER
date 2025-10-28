# WordER - Project Documentation for Claude

## Project Overview
WordER는 Electron 기반 데스크톱 단어장 애플리케이션입니다. 사용자가 영어 단어와 한국어 뜻, 예문을 관리하고 시험지를 생성할 수 있는 기능을 제공합니다.

## Tech Stack
- **Frontend**: React 18 + TypeScript
- **Desktop Framework**: Electron 31
- **Build Tool**: Vite 5
- **UI Framework**: shadcn/ui (Tailwind CSS 기반)
- **State Management**: Zustand
- **Database**: better-sqlite3 (로컬 SQLite)
- **Export**: jsPDF (PDF), xlsx (Excel)

## Project Structure
```
WordER/
├── electron/              # Electron 메인 프로세스
│   ├── main.ts           # 메인 프로세스 엔트리
│   └── preload.ts        # 프리로드 스크립트 (IPC 브릿지)
├── src/                  # React 애플리케이션
│   ├── components/       # React 컴포넌트
│   │   └── ui/          # shadcn/ui 컴포넌트
│   ├── lib/             # 유틸리티 함수
│   ├── App.tsx          # 메인 앱 컴포넌트
│   ├── main.tsx         # React 엔트리포인트
│   └── index.css        # Tailwind 스타일
├── dist/                # Vite 빌드 출력 (프론트엔드)
├── dist-electron/       # Electron 빌드 출력
└── release/             # Electron-builder 패키징 출력
```

## Key Features to Implement

### 1. Tab Management (탭 관리)
- **Description**: 엑셀의 시트와 유사한 탭 시스템
- **Requirements**:
  - 여러 탭 생성/삭제/전환
  - 각 탭에 unique name 지정
  - 탭 간 빠른 전환 UI

### 2. Word Entry System (단어 입력)
- **Description**: 각 탭에서 단어 정보 관리
- **Fields**:
  - English word (영어 단어)
  - Korean meaning (한국어 뜻)
  - Example sentence (예문)
- **Features**:
  - 개별 필드 가리기/보이기 (눈 아이콘)
  - 전체 가리기 토글

### 3. Data Persistence (데이터 저장)
- **Local Storage**: SQLite (better-sqlite3)
- **Schema**:
  ```sql
  -- tabs 테이블
  CREATE TABLE tabs (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- words 테이블
  CREATE TABLE words (
    id INTEGER PRIMARY KEY,
    tab_id INTEGER NOT NULL,
    english TEXT NOT NULL,
    korean TEXT NOT NULL,
    example TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tab_id) REFERENCES tabs(id) ON DELETE CASCADE
  );
  ```

### 4. Cloud Sync (클라우드 동기화)
- **Approach**: Light solution - 파일 기반 동기화
- **Options**:
  - Google Drive/Dropbox 앱 폴더에 SQLite 파일 저장
  - 또는 JSON export/import 기능으로 수동 동기화
- **Implementation Priority**: Phase 2 (기본 기능 완성 후)

### 5. Test Generator (시험지 생성)
- **Input**: Tab name(s) 선택
- **Output**: 선택된 탭의 단어들을 랜덤 순서로 섞은 시험지
- **Features**:
  - 여러 탭 선택 가능
  - 랜덤 셔플
  - 프린트/PDF 출력 지원

### 6. Export Functionality (내보내기)
- **Formats**:
  - PDF: jsPDF + jsPDF-AutoTable 사용
  - Excel: xlsx 라이브러리 사용
- **Scope**: 선택된 탭(시트) 단위로 export

## Development Commands

```bash
# 의존성 설치
npm install

# 개발 모드 실행 (Electron + Hot Reload)
npm run electron:dev

# 프론트엔드만 개발 (브라우저)
npm run dev

# 빌드 (프로덕션)
npm run build

# Electron 앱 패키징
npm run electron:build

# Lint
npm run lint
```

## Database Access Pattern

Electron의 IPC (Inter-Process Communication)를 통해 데이터베이스에 접근합니다:

1. **Renderer Process** (React): UI 이벤트 발생
2. **Preload Script**: IPC 메시지 전달
3. **Main Process**: SQLite 쿼리 실행 및 결과 반환

Example:
```typescript
// Renderer (React)
const tabs = await window.electron.db.getTabs()

// Preload (electron/preload.ts)
db: {
  getTabs: () => ipcRenderer.invoke('db:getTabs')
}

// Main (electron/main.ts)
ipcMain.handle('db:getTabs', async () => {
  // SQLite query
  return db.prepare('SELECT * FROM tabs').all()
})
```

## UI/UX Guidelines

- **Design System**: shadcn/ui 컴포넌트 사용
- **Color Scheme**: 기본 테마 (light mode)
- **Layout**:
  - Top: Tab list (horizontal scroll)
  - Main: Word table/cards
  - Sidebar: Export & test generation controls

## Development Notes

### Phase 1: Core Features (우선순위 높음)
1. Tab management UI
2. Word CRUD operations
3. SQLite database setup
4. Hide/show functionality

### Phase 2: Advanced Features
1. Test generator
2. PDF/Excel export
3. Cloud sync (optional)

### Phase 3: Polish
1. UI/UX improvements
2. Performance optimization
3. Error handling
4. User settings

## Known Issues / TODO
- [ ] 의존성 설치 필요 (`npm install`)
- [ ] Database schema 초기화 코드 작성
- [ ] IPC handlers 구현 (main.ts)
- [ ] 상태 관리 스토어 설정 (Zustand)
- [ ] 메인 UI 컴포넌트 구현

## Git Repository
Repository URL: (GitHub repo 연동 후 추가 예정)

## License
MIT
