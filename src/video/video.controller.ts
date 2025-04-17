import { Controller, Get, Param, Header, Query } from '@nestjs/common';
import { VideoService } from './video.service';
import { Video } from '@prisma/client';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get('')
  async findAll(
    @Query('page') page: string = '1',
    @Query('search') search: string,
  ): Promise<{
    videos: Video[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    return await this.videoService.findAll(+page, search);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string): Promise<Video> {
    return await this.videoService.findOne(slug);
  }

  @Get(':slug/similar')
  async getSimilar(
    @Param('slug') slug: string,
    @Query('page') page = '1',
  ): Promise<{
    videos: Video[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const pageNum = parseInt(page, 10) || 1;
    return await this.videoService.findSimilar(slug, pageNum);
  }

  @Get('sitemap/generate')
  @Header('Content-Type', 'application/xml')
  async getSitemap(): Promise<string> {
    const videos: Video[] = await this.videoService.allVideos();
    return this.videoService.generateSiteMap(videos);
  }
}
