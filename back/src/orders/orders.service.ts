import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: number, dto: CreateOrderDto) {
    if (customerId === dto.chefId) {
      throw new BadRequestException('Cannot order from yourself');
    }

    // Verify chef exists
    const chef = await this.prisma.user.findUnique({ where: { id: dto.chefId } });
    if (!chef) {
      throw new NotFoundException('Chef not found');
    }

    // Verify all lunches belong to the chef
    const lunches = await this.prisma.lunch.findMany({
      where: { id: { in: dto.lunchIds }, userId: dto.chefId },
    });

    if (lunches.length !== dto.lunchIds.length) {
      throw new BadRequestException('Some lunches do not belong to the specified chef');
    }

    const order = await this.prisma.order.create({
      data: {
        customerId,
        chefId: dto.chefId,
        comment: dto.comment,
        items: {
          create: dto.lunchIds.map((lunchId) => ({ lunchId })),
        },
        history: {
          create: { status: OrderStatus.PENDING },
        },
      },
      include: this.orderInclude,
    });

    return this.formatOrder(order);
  }

  async findAll(userId: number, query: OrderQueryDto) {
    const where: any = {};

    if (query.role === 'customer') {
      where.customerId = userId;
    } else if (query.role === 'chef') {
      where.chefId = userId;
    } else {
      where.OR = [{ customerId: userId }, { chefId: userId }];
    }

    if (query.status) {
      where.status = query.status;
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: this.orderInclude,
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(this.formatOrder);
  }

  async findOne(id: number, userId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: this.orderInclude,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== userId && order.chefId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.formatOrder(order);
  }

  async updateStatus(id: number, userId: number, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Only chef can update status (except CANCELLED which customer can do)
    if (dto.status === OrderStatus.CANCELLED) {
      if (order.customerId !== userId && order.chefId !== userId) {
        throw new ForbiddenException('Access denied');
      }
    } else {
      if (order.chefId !== userId) {
        throw new ForbiddenException('Only chef can update order status');
      }
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        history: {
          create: { status: dto.status, comment: dto.comment },
        },
      },
      include: this.orderInclude,
    });

    return this.formatOrder(updated);
  }

  async getHistory(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: {
        OR: [{ customerId: userId }, { chefId: userId }],
        status: { in: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] },
      },
      include: this.orderInclude,
      orderBy: { updatedAt: 'desc' },
    });

    return orders.map(this.formatOrder);
  }

  private orderInclude = {
    customer: { select: { id: true, name: true, avatarUrl: true } },
    chef: { select: { id: true, name: true, avatarUrl: true } },
    items: {
      include: {
        lunch: {
          include: { images: { take: 1, orderBy: { position: 'asc' as const } } },
        },
      },
    },
    history: { orderBy: { createdAt: 'desc' as const } },
  };

  private formatOrder(order: any) {
    return {
      id: order.id,
      status: order.status,
      comment: order.comment,
      customer: order.customer,
      chef: order.chef,
      items: order.items.map((item: any) => ({
        id: item.id,
        lunch: {
          id: item.lunch.id,
          title: item.lunch.title,
          image: item.lunch.images[0]?.url || null,
        },
      })),
      history: order.history,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
