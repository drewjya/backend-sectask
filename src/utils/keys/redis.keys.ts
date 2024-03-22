export function getRedis() {
  return {
    accessToken(userId: number) {
      return `access_token_${userId}`;
    },
    refreshToken(userId: number) {
      return `refresh_token_${userId}`;
    },
  };
}
