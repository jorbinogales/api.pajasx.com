import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Video } from '@prisma/client';
import { VIDEO_POR_PAGE } from 'src/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VideoService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  getUrlDomain() {
    return this.configService.get<string>('URL_DOMAIN');
  }

  async allVideos(): Promise<Video[]> {
    return await this.prisma.video.findMany();
  }

  async findAll(
    page: number = 1,
    search?: string,
  ): Promise<{
    videos: Video[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const limit = VIDEO_POR_PAGE;
    const skip = (page - 1) * limit;
    let where: Prisma.VideoWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [videos, total] = await Promise.all([
      this.prisma.video.findMany({
        where: where,
        skip: skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.video.count({
        where: where,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
      videos,
      total,
      currentPage: page,
      totalPages,
    };
  }

  async findOne(slug: string): Promise<Video> {
    return await this.prisma.video.findFirst({
      where: {
        slug,
      },
    });
  }

  generateSiteMap(videos: Video[]): string {
    const totalVideos = videos.length;
    const perPage = VIDEO_POR_PAGE;
    const totalPages = Math.ceil(totalVideos / perPage);

    // 🔹 1. URLs de paginación
    const paginationUrls = Array.from(
      { length: totalPages },
      (_, i) => `
      <url>
        <loc>${this.getUrlDomain()}/page/${i + 1}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </url>
    `,
    ).join('');

    // 🔹 2. URLs de videos individuales
    const videoUrls = videos
      .map(
        (video) => `
      <url>
        <loc>${this.getUrlDomain()}/${video.slug}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </url>
    `,
      )
      .join('');

    // 🔹 3. Sitemap completo
    return `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${paginationUrls}
        ${videoUrls}
      </urlset>`;
  }

  async findSimilar(
    slug: string,
    page: number = 1,
  ): Promise<{
    videos: Video[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const original = await this.prisma.video.findFirst({
      where: { slug },
      select: { name: true },
    });
    if (!original) throw new NotFoundException(`Video ${slug} no encontrado`);

    // 2. Saca keywords del título
    const keywords = original.name
      .split(/\s+/)
      .map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter((w) => w.length > 3)
      .slice(0, 3);
    if (keywords.length === 0) {
      return { videos: [], total: 0, currentPage: page, totalPages: 0 };
    }

    let where: Prisma.VideoWhereInput = {
      AND: [
        { slug: { not: slug } },
        {
          OR: keywords.map((kw) => ({
            name: { contains: kw, mode: 'insensitive' },
          })),
        },
      ],
    };

    const skip = (Math.max(1, page) - 1) * VIDEO_POR_PAGE;

    const [videos, total] = await Promise.all([
      this.prisma.video.findMany({
        where,
        skip,
        take: VIDEO_POR_PAGE,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.video.count({ where }),
    ]);
    const totalPages = Math.ceil(total / VIDEO_POR_PAGE);
    return { videos, total, currentPage: page, totalPages };
  }
}
