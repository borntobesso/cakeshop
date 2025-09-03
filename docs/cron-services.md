# Cron 서비스 설정 가이드

## 1. Vercel Cron Jobs (Pro 플랜 필요)

**설정:**
- `vercel.json` 파일이 이미 생성됨
- Vercel Pro 플랜에 업그레이드 필요
- 자동으로 `/api/cron/send-reminders`를 5분마다 호출

**장점:**
- Vercel과 완벽 통합
- 안정적이고 관리 불필요

**단점:**
- 유료 (Pro 플랜: $20/month)

## 2. GitHub Actions (무료)

**설정:**
1. GitHub Secrets에 환경변수 추가:
   - `APP_URL`: https://your-app.vercel.app
   - `CRON_SECRET_TOKEN`: 랜덤한 보안 토큰

**장점:**
- 완전 무료
- GitHub과 통합

**단점:**
- GitHub 저장소가 public이어야 무제한 사용 가능
- Private 저장소는 월 2,000분 제한

## 3. 무료 외부 Cron 서비스들

### cron-job.org (추천)
```bash
URL: https://your-app.vercel.app/api/cron/send-reminders
Method: POST
Schedule: */5 * * * * (every 5 minutes)
Headers: 
  Content-Type: application/json
  Authorization: Bearer YOUR_CRON_SECRET_TOKEN
```

### EasyCron
- 무료: 월 100회 실행
- URL: https://www.easycron.com

### Cronhooks
- 무료: 월 1,000회 실행
- URL: https://cronhooks.io

## 4. 수동 테스트

개발 중에는 수동으로 테스트:

```bash
# 로컬에서
curl -X POST http://localhost:3000/api/cron/send-reminders

# 프로덕션에서
curl -X POST https://your-app.vercel.app/api/cron/send-reminders
```

## 보안 설정

환경변수에 추가 (.env.local):
```env
CRON_SECRET_TOKEN=your-super-secret-random-token-here-12345
```