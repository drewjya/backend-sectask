dev:
	pnpm run start:dev

migrate:
	pnpm exec prisma migrate dev

reset:
	pnpm exec prisma migrate reset