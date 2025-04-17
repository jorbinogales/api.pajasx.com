import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SeedService {
  
  constructor(private prisma: PrismaService){}

  async runSeed() {
    try {
      for (let page = 1; page <= 10000; page++) {
        try {
          const response = await axios.get(`https://api.adultdatalink.com/xvideos/feed?page=${page}`);
          const videos = response.data;

          for (const item of videos) {

            await this.prisma.video.create({
              data: {
                name: item.name,
                slug: this.toSlug(item.name),
                thumbnailUrl: item.thumbnail_url,
                embedUrl: item.embed_url,
                videoUrl: item.video_url,
                views: item.views,
                time: item.duration,
              },
            });
          }

          console.log(`✅ Página ${page} procesada.`);

          // Espera 500ms entre páginas para evitar bloqueo del servidor
          await this.sleep(500);

        } catch (error) {
          console.error(`❌ Error en la página ${page}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Error al ejecutar la semilla:', error);
    } finally {
      await this.prisma.$disconnect();
    }
  }

  toSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[\s\-]+/g, '_')     // reemplaza espacios y guiones por "_"
      .replace(/[^\w_]/g, '')       // elimina cualquier carácter que no sea letra, número o "_"
      .trim();
  }

  // Función de espera
  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Función para parsear las vistas
  private parseViews(viewsString: string): number {
    if (viewsString.toLowerCase().includes('m')) {
      return Math.round(parseFloat(viewsString) * 1_000_000);
    }
    if (viewsString.toLowerCase().includes('k')) {
      return Math.round(parseFloat(viewsString) * 1_000);
    }
    return parseInt(viewsString.replace(/\D/g, ''), 10);
  }
}
