import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly baseUrl: string;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>('AI_BASE_URL') ?? 'http://localhost:8005';
  }

  async health() {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      if (!res.ok) {
        throw new HttpException('AI service error', HttpStatus.BAD_GATEWAY);
      }
      return res.json();
    } catch (e) {
      throw new HttpException('AI service unreachable', HttpStatus.BAD_GATEWAY);
    }
  }
}

