import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import {
  CreateLunchDto,
  UpdateLunchDto,
  LunchQueryDto,
  AddImageDto,
} from './dto/lunch.dto';

@Injectable()
export class LunchesService {
  private readonly logger = new Logger(LunchesService.name);

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async findAll(query: LunchQueryDto) {
    const { userId, page = 1, perPage = 12 } = query;
    const skip = (page - 1) * perPage;

    const where = userId ? { userId } : {};

    const [lunches, total] = await Promise.all([
      this.prisma.lunch.findMany({
        where,
        include: { images: { orderBy: { position: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
      }),
      this.prisma.lunch.count({ where }),
    ]);

    return {
      data: lunches.map(this.formatLunch),
      meta: {
        currentPage: page,
        totalPages: Math.ceil(total / perPage),
        totalCount: total,
        perPage,
      },
    };
  }

  async findOne(id: number) {
    const lunch = await this.prisma.lunch.findUnique({
      where: { id },
      include: { images: { orderBy: { position: 'asc' } } },
    });

    if (!lunch) {
      throw new NotFoundException('Lunch not found');
    }

    return this.formatLunch(lunch);
  }

  async create(userId: number, dto: CreateLunchDto) {
    const lunch = await this.prisma.lunch.create({
      data: {
        userId,
        title: dto.title || 'Новый обед',
        recipe: dto.recipe,
        calories: dto.calories,
        proteins: dto.proteins,
        fats: dto.fats,
        carbs: dto.carbs,
        cookingTime: dto.cookingTime,
        difficulty: dto.difficulty,
        tags: dto.tags || [],
      },
      include: { images: true },
    });

    return this.formatLunch(lunch);
  }

  async update(id: number, userId: number, dto: UpdateLunchDto) {
    const lunch = await this.prisma.lunch.findUnique({ where: { id } });

    if (!lunch) {
      throw new NotFoundException('Lunch not found');
    }

    if (lunch.userId !== userId) {
      throw new ForbiddenException('You can only edit your own lunches');
    }

    const updated = await this.prisma.lunch.update({
      where: { id },
      data: dto,
      include: { images: { orderBy: { position: 'asc' } } },
    });

    return this.formatLunch(updated);
  }

  async delete(id: number, userId: number) {
    const lunch = await this.prisma.lunch.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!lunch) {
      throw new NotFoundException('Lunch not found');
    }

    if (lunch.userId !== userId) {
      throw new ForbiddenException('You can only delete your own lunches');
    }

    // Delete images from storage
    for (const image of lunch.images) {
      if (image.key && !image.key.startsWith('local-')) {
        await this.storage.delete(image.key).catch((e) =>
          this.logger.warn(`Failed to delete storage object ${image.key}: ${e.message}`),
        );
      }
    }

    await this.prisma.lunch.delete({ where: { id } });

    return { message: 'Deleted' };
  }

  async addImage(lunchId: number, userId: number, dto: AddImageDto) {
    const lunch = await this.prisma.lunch.findUnique({ where: { id: lunchId } });

    if (!lunch) {
      throw new NotFoundException('Lunch not found');
    }

    if (lunch.userId !== userId) {
      throw new ForbiddenException('You can only edit your own lunches');
    }

    const maxPosition = await this.prisma.lunchImage.aggregate({
      where: { lunchId },
      _max: { position: true },
    });

    const image = await this.prisma.lunchImage.create({
      data: {
        lunchId,
        url: dto.url,
        key: dto.key,
        width: dto.width,
        height: dto.height,
        position: (maxPosition._max.position || 0) + 1,
      },
    });

    return image;
  }

  async deleteImage(lunchId: number, imageId: number, userId: number) {
    const lunch = await this.prisma.lunch.findUnique({ where: { id: lunchId } });

    if (!lunch) {
      throw new NotFoundException('Lunch not found');
    }

    if (lunch.userId !== userId) {
      throw new ForbiddenException('You can only edit your own lunches');
    }

    const image = await this.prisma.lunchImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.prisma.lunchImage.delete({ where: { id: imageId } });

    if (image.key && !image.key.startsWith('seed-')) {
      await this.storage.delete(image.key).catch((e) =>
        this.logger.warn(`Failed to delete S3 object ${image.key}: ${e.message}`),
      );
    }

    return { message: 'Image deleted' };
  }

  async uploadImage(lunchId: number, userId: number, file: Express.Multer.File) {
    const lunch = await this.prisma.lunch.findUnique({ where: { id: lunchId } });

    if (!lunch) {
      throw new NotFoundException('Lunch not found');
    }

    if (lunch.userId !== userId) {
      throw new ForbiddenException('You can only edit your own lunches');
    }

    const { key, url } = await this.storage.upload(file, `lunches/${lunchId}`);

    try {
      const maxPosition = await this.prisma.lunchImage.aggregate({
        where: { lunchId },
        _max: { position: true },
      });

      const image = await this.prisma.lunchImage.create({
        data: {
          lunchId,
          url,
          key,
          position: (maxPosition._max.position || 0) + 1,
        },
      });

      return {
        id: image.id,
        url: image.url,
        width: image.width,
        height: image.height,
      };
    } catch (dbError) {
      this.logger.error(
        `DB error after upload, cleaning up orphan file: ${key}`,
        dbError,
      );
      await this.storage.delete(key).catch((e) =>
        this.logger.error(`Failed to cleanup orphan file ${key}`, e),
      );
      throw dbError;
    }
  }

  private formatLunch(lunch: any) {
    return {
      id: lunch.id,
      userId: lunch.userId,
      title: lunch.title,
      recipe: lunch.recipe,
      calories: lunch.calories,
      proteins: lunch.proteins,
      fats: lunch.fats,
      carbs: lunch.carbs,
      cookingTime: lunch.cookingTime,
      difficulty: lunch.difficulty,
      tags: lunch.tags || [],
      images: (lunch.images || []).map((img: any) => ({
        id: img.id,
        url: img.url,
        width: img.width,
        height: img.height,
      })),
      createdAt: lunch.createdAt,
      updatedAt: lunch.updatedAt,
    };
  }
}
