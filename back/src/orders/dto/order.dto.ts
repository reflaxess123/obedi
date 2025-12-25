import { IsInt, IsArray, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({ description: 'Chef user ID (owner of recipes)' })
  @IsInt()
  chefId: number;

  @ApiProperty({ description: 'Array of lunch IDs to order' })
  @IsArray()
  @IsInt({ each: true })
  lunchIds: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}

export class OrderQueryDto {
  @ApiPropertyOptional({ description: 'Filter by role: customer or chef' })
  @IsOptional()
  @IsString()
  role?: 'customer' | 'chef';

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
