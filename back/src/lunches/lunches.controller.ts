import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { LunchesService } from './lunches.service';
import {
  CreateLunchDto,
  UpdateLunchDto,
  LunchQueryDto,
  AddImageDto,
} from './dto/lunch.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('lunches')
@Controller('api/v1/lunches')
export class LunchesController {
  constructor(private lunchesService: LunchesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all lunches with pagination' })
  findAll(@Query() query: LunchQueryDto) {
    return this.lunchesService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get lunch by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lunchesService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new lunch' })
  create(@Body() dto: CreateLunchDto, @CurrentUser() user: User) {
    return this.lunchesService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lunch' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLunchDto,
    @CurrentUser() user: User,
  ) {
    return this.lunchesService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete lunch' })
  delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.lunchesService.delete(id, user.id);
  }

  @Post(':id/images')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add image to lunch' })
  addImage(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddImageDto,
    @CurrentUser() user: User,
  ) {
    return this.lunchesService.addImage(id, user.id, dto);
  }

  @Delete(':id/images/:imageId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete image from lunch' })
  deleteImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @CurrentUser() user: User,
  ) {
    return this.lunchesService.deleteImage(id, imageId, user.id);
  }

  @Post(':id/images/upload')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload image to lunch' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only images are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.lunchesService.uploadImage(id, user.id, file);
  }
}
