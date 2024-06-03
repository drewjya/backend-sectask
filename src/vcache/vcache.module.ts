import { Module } from '@nestjs/common';
import { VCacheService } from './vcache.service';

@Module({
    providers: [VCacheService],
    exports: [VCacheService]
})
export class VCacheModule { }
