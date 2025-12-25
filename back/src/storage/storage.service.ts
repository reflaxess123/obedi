import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

export interface UploadResult {
  key: string;
  url: string;
}

@Injectable()
export class StorageService {
  private readonly supabase: SupabaseClient;
  private readonly bucket: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!url || !key) {
      throw new Error(
        'Supabase configuration is incomplete. Check SUPABASE_URL and SUPABASE_SERVICE_KEY env variables.',
      );
    }

    this.bucket = this.configService.get<string>('SUPABASE_BUCKET', 'lunches');
    this.supabase = createClient(url, key);
  }

  async upload(
    file: Express.Multer.File,
    folder = 'images',
  ): Promise<UploadResult> {
    const ext = file.originalname.split('.').pop() || 'jpg';
    const key = `${folder}/${randomUUID()}.${ext}`;

    this.logger.log(`Uploading file to ${key}`);

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(key, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Upload failed: ${error.message}`);
      throw new InternalServerErrorException(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(key);

    this.logger.log(`File uploaded: ${urlData.publicUrl}`);

    return { key, url: urlData.publicUrl };
  }

  async delete(key: string): Promise<void> {
    this.logger.log(`Deleting file: ${key}`);

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([key]);

    if (error) {
      this.logger.error(`Delete failed: ${error.message}`);
      throw new InternalServerErrorException(`Delete failed: ${error.message}`);
    }

    this.logger.log(`File deleted: ${key}`);
  }
}
