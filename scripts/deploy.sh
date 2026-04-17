#!/bin/bash

# Happy Birthday 생일 파티 앱 배포 스크립트
# 사용법: ./scripts/deploy.sh [prod|dev]

set -e

ENVIRONMENT=${1:-prod}
REMOTE_USER="ubuntu"
REMOTE_HOST="132.145.91.163"
REMOTE_PATH="~/apps/happy-birthday"
SSH_KEY="~/.ssh/id_ed25519_oci"

echo "🎂 Happy Birthday 배포 스크립트"
echo "환경: $ENVIRONMENT"
echo

# 1. 로컬 빌드
echo "📦 로컬 빌드 중..."
cd "$(dirname "$0")/.."

echo "  - server 빌드..."
cd server && npx tsc --project tsconfig.server.json && cd ..

echo "  - client 빌드..."
cd client && npx tsc && npx vite build && cd ..

echo "✓ 빌드 완료"
echo

# 2. 원격 서버 디렉토리 생성
echo "📁 원격 디렉토리 확인..."
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" "mkdir -p $REMOTE_PATH"
echo "✓ 원격 디렉토리 준비 완료"
echo

# 3. 파일 전송
echo "📤 파일 전송 중..."
rsync -avz --exclude='node_modules' --exclude='.git' \
  --exclude='client/node_modules' --exclude='.serena' --exclude='.omx' \
  --exclude='.next' --exclude='vite-*.log' \
  ./ -e "ssh -i $SSH_KEY" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

echo "✓ 파일 전송 완료"
echo

# 4. 의존성 설치
echo "📥 원격 의존성 설치..."
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" \
  "cd $REMOTE_PATH && npm install --production"
echo "✓ 의존성 설치 완료"
echo

# 5. PM2 업데이트
echo "🚀 PM2 서비스 재시작..."
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" \
  "cd $REMOTE_PATH && pm2 delete happy-birthday 2>/dev/null || true && \
   pm2 start server/lib/server/index.js --name happy-birthday && \
   pm2 save"
echo "✓ PM2 서비스 시작 완료"
echo

# 6. 상태 확인
echo "✅ 배포 완료!"
echo
echo "📊 서비스 상태:"
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" "pm2 list | grep happy-birthday"
echo
echo "🌐 접속 주소: https://birthday.brian-dev.cloud"
echo "💻 로그 확인: ssh -i ~/.ssh/id_ed25519_oci ubuntu@132.145.91.163"
echo "            pm2 logs happy-birthday"
