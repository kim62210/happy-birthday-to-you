# Happy Birthday 배포 가이드

## 배포 환경
- **서버**: OCI ARM (Ubuntu 24.04)
- **주소**: 132.145.91.163 (oci-arm SSH alias)
- **도메인**: birthday.brian-dev.cloud
- **리버스 프록시**: Caddy (Docker)
- **프로세스 관리**: PM2

## 자동 배포

### 빠른 배포 (권장)
```bash
./scripts/deploy.sh
```

이 스크립트는 다음 작업을 자동으로 수행합니다:
1. 로컬에서 server와 client 빌드
2. OCI 서버에 파일 전송 (rsync)
3. 원격에서 npm 의존성 설치
4. PM2 서비스 재시작
5. 배포 상태 확인

## 수동 배포 단계

### 1. 로컬 빌드
```bash
# Server 빌드 (server/lib/ 생성)
cd server && npx tsc --project tsconfig.server.json

# Client 빌드 (client/dist/ 생성)
cd client && npx tsc && npx vite build
```

### 2. 파일 전송
```bash
rsync -avz --exclude='node_modules' --exclude='.git' \
  --exclude='client/node_modules' \
  ./ -e "ssh -i ~/.ssh/id_ed25519_oci" \
  ubuntu@132.145.91.163:~/apps/happy-birthday/
```

### 3. 의존성 설치 (원격)
```bash
ssh -i ~/.ssh/id_ed25519_oci ubuntu@132.145.91.163
cd ~/apps/happy-birthday
npm install --production
```

### 4. PM2 서비스 시작 (원격)
```bash
pm2 delete happy-birthday || true
pm2 start server/lib/server/index.js --name happy-birthday
pm2 save
```

## 배포 아키텍처

### 파일 구조 (서버)
```
~/apps/happy-birthday/
├── server/
│   ├── lib/              # 컴파일된 JavaScript
│   │   ├── server/
│   │   │   └── index.js (진입점)
│   │   └── rooms/
│   ├── index.ts
│   └── tsconfig.server.json
├── client/
│   └── dist/             # Vite 빌드 결과물
│       ├── index.html
│       └── assets/
├── types/                # 공유 타입 (TS 원본)
├── package.json
├── yarn.lock
└── node_modules/         # 서버 의존성
```

### 실행 흐름
1. **Express 서버**: `server/lib/server/index.js`가 포트 2567 수신
2. **정적 파일**: `express.static('client/dist')` → 프론트엔드 제공
3. **WebSocket**: Colyseus 게임 서버 (같은 포트)
4. **리버스 프록시**: Caddy가 `birthday.brian-dev.cloud` → `host.docker.internal:2567` 프록시

## 포트 및 주소

| 서비스 | 주소 | 설명 |
|-------|------|------|
| HTTP | http://127.0.0.1:2567 | 서버 로컬 접속 |
| HTTPS | https://birthday.brian-dev.cloud | 공개 도메인 (Caddy) |
| Colyseus Monitor | http://localhost:2567/colyseus | 게임 서버 모니터링 |

## 로그 및 모니터링

### PM2 로그 확인
```bash
ssh -i ~/.ssh/id_ed25519_oci ubuntu@132.145.91.163

# 실시간 로그
pm2 logs happy-birthday

# 마지막 50줄
pm2 logs happy-birthday --lines 50 --nostream

# 서비스 상태
pm2 list
```

### 서버 포트 상태
```bash
ssh -i ~/.ssh/id_ed25519_oci ubuntu@132.145.91.163
lsof -i :2567
```

## 트러블슈팅

### 연결 안 됨
1. PM2 상태 확인: `pm2 list | grep happy-birthday`
2. 포트 수신 확인: `lsof -i :2567`
3. HTTP 응답 테스트: `curl http://127.0.0.1:2567/`
4. 로그 확인: `pm2 logs happy-birthday`

### Caddy 도메인 문제
1. Caddyfile 문법 확인: `docker exec caddy caddy validate --config /etc/caddy/Caddyfile`
2. Caddy 로그: `docker logs caddy | tail -50`
3. 재로드: `docker exec caddy caddy reload --config /etc/caddy/Caddyfile`

### 빌드 실패
- types 디렉토리는 TypeScript 파일만 포함 (빌드 스크립트 불필요)
- server 빌드 결과: `server/lib/`
- client 빌드 결과: `client/dist/`
- 프로덕션 경로: server.index.ts의 `express.static('client/dist')`

## 환경 변수

현재 기본값 사용:
- `PORT`: 2567 (기본값)
- `HOST`: 0.0.0.0 (모든 인터페이스)

필요 시 PM2 환경 변수 설정:
```bash
pm2 start server/lib/server/index.js \
  --name happy-birthday \
  --env "PORT=2567,HOST=0.0.0.0"
```

## 보안 설정

### Caddy 헤더 (기본 설정됨)
- `Strict-Transport-Security`: HTTPS 강제
- `X-Content-Type-Options`: nosniff (MIME 스니핑 방지)
- `X-Frame-Options`: DENY (클릭 재킹 방지)
- `Server`, `X-Powered-By`: 제거 (버전 은닉)

## 백업 및 복구

### 파일 백업
```bash
ssh -i ~/.ssh/id_ed25519_oci ubuntu@132.145.91.163
tar -czf ~/apps/happy-birthday.backup.tar.gz ~/apps/happy-birthday/
```

### 복구
```bash
ssh -i ~/.ssh/id_ed25519_oci ubuntu@132.145.91.163
rm -rf ~/apps/happy-birthday
tar -xzf ~/apps/happy-birthday.backup.tar.gz -C ~/apps/
```

## 배포 체크리스트

- [ ] 로컬 빌드 성공 (`server/lib/`, `client/dist/` 생성)
- [ ] 파일 전송 완료
- [ ] 원격 의존성 설치 완료
- [ ] PM2 서비스 시작됨 (pm2 list 확인)
- [ ] HTTP 200 응답 (curl 테스트)
- [ ] 도메인 접속 가능
- [ ] WebSocket 연결 확인 (브라우저 DevTools)
