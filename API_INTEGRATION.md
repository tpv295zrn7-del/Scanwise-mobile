# API Integration Guide

## Base URL
`https://api.scanwise.app`

## Auth endpoints
- `POST /auth/login`
- `POST /auth/signup`
- `POST /auth/logout`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

## Profile endpoints
- `GET /profile`
- `PUT /profile`
- `POST /profile/family`

## Onboarding endpoints
- `POST /onboarding`
- `POST /onboarding/complete`

## Error code mapping
- `INVALID_CREDENTIALS` → Email or password is incorrect.
- `EMAIL_EXISTS` → Account already exists.
- `EMAIL_NOT_FOUND` → No account found.
- `WEAK_PASSWORD` → Password does not meet requirements.
- `EXPIRED_TOKEN` → Link expired.
- `NETWORK_TIMEOUT` → Network timeout.

## Token refresh flow
1. Access token is attached in request interceptor.
2. If a `401` occurs, refresh token is used to call `/auth/refresh`.
3. Tokens are persisted and original request is retried.
4. If refresh fails, stored tokens are cleared.

## Deep links
- `scanwise://reset-password?token=XXX`
- `scanwise://home`
