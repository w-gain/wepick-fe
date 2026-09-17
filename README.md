# WePick Frontend

WePick의 사용자 화면, 상호작용과 API 연동을 구현하는 저장소입니다.

제품·정책·화면 정의·디자인 원본과 공통 API 설계는 [wepick-product](https://github.com/W-Gain/wepick-product)가 관리합니다. 구현할 때 [프런트엔드 기술 스택 결정](https://github.com/W-Gain/wepick-product/blob/main/docs/decisions/0002-frontend-technology-stack.md)과 [마이그레이션 계획](https://github.com/W-Gain/wepick-product/blob/main/docs/working/frontend-migration-plan.md)을 따릅니다.

## 현재 구현 상태

React SPA 기반, 빈 화면 route, 디자인 토큰과 정적 빌드 구성이 `dev`에 반영됐습니다. Express·바닐라 JavaScript MPA와 기존 게시판 화면은 제거했습니다. 실제 화면, mock과 API 연동은 후속 PR에서 추가합니다.

## 기술 구성

| 역할          | 도구                                |
| ------------- | ----------------------------------- |
| UI            | React, TypeScript                   |
| 빌드          | Vite                                |
| 라우팅        | React Router Data Mode              |
| 서버 상태     | TanStack Query                      |
| API 계약 검증 | Zod                                 |
| 스타일        | Tailwind CSS, CSS custom properties |
| 테스트        | Vitest, React Testing Library       |
| 운영 서빙     | Caddy가 Vite `dist/` 직접 제공      |

## 로컬 실행

Node.js 24.15 이상과 npm을 사용합니다.

```bash
npm ci
npm run dev
```

Vite 개발 서버는 `/api` 요청에서 prefix를 제거해 `http://localhost:8080`으로 전달합니다. `/uploads`도 같은 BE 개발 서버로 전달합니다.

## 명령

| 명령                   | 역할                         |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Vite 개발 서버               |
| `npm run typecheck`    | TypeScript 검사              |
| `npm run lint`         | ESLint 검사                  |
| `npm run format:check` | Prettier 검사                |
| `npm test`             | Vitest 한 번 실행            |
| `npm run build`        | 타입 검사 후 `dist/` 생성    |
| `npm run preview`      | 생성된 `dist/` 로컬 미리보기 |

## 화면 route

| URL              | 화면 ID                |
| ---------------- | ---------------------- |
| `/`              | `SCR-001` 오늘의 Pick  |
| `/picks`         | `SCR-002` 지난 Pick    |
| `/picks/:pickId` | `SCR-003` Pick 상세    |
| `/history`       | `SCR-004` 내 투표 기록 |
| `/profile`       | `SCR-005` 프로필       |
| `/profile/edit`  | `SCR-006` 프로필 편집  |

## 운영 이미지

다단계 Docker build가 Node 단계에서 Vite `dist/`를 만들고 최종 Caddy 이미지의 `/srv/frontend`에 복사합니다. 운영 컨테이너에는 Express 애플리케이션을 실행하지 않습니다.

```bash
docker build -f docker/prod/dockerfile -t wepick-fe .
```

최종 운영에서는 Infra의 Caddyfile을 이미지에 읽기 전용으로 마운트해 80/443에서 정적 파일, `/api` 프록시와 `/uploads`를 함께 제공합니다. Infra 전환 전에는 현재 운영 Compose에 이 이미지를 배포하지 않습니다.
