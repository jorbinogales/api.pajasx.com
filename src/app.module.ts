import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SeedModule } from './seed/seed.module';
import { VideoModule } from './video/video.module';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './configuration';

@Module({
  imports: [
    SeedModule,
    VideoModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
