import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { unauthorized } from 'src/utils/exception/common.exception';

@Injectable()
export class VCacheService {
    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) { }


    async setSessionUser(userId: number, sessionId: string) {
        await this.cacheManager.set(`user:${userId}`, sessionId, 1000 * 3600 * 24 * 7)
    }
    async verifySessionUser(userId: number, sessionId: string) {

        const value = await this.cacheManager.get(`user:${userId}`)

        if (value !== sessionId) {
            throw unauthorized;
        }
        return true
    }

    async setFindingRequest(findingId: number, value: any) {
        await this.cacheManager.set(`finding:${findingId}`, value, 1000 * 3600)
    }

}
