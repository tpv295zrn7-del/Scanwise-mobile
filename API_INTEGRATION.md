# API Integration

## Endpoints

See `src/utils/constants.js` `ENDPOINTS` for login/signup/logout/refresh/password/profile CRUD.

## Token refresh

401 responses trigger refresh using stored refresh token and retry original request.

## Error mapping

Backend codes are mapped in `src/utils/errorMapping.js`.

## Deep linking

- `scanwise://reset-password?token=XXX`
- `scanwise://home`
