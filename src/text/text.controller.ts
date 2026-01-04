import { Body, Controller, Post } from '@nestjs/common';
import { TextService } from './text.service';
import { CreateTextDto } from './dto/createText.dto';

@Controller('texts')
export class TextController {
  constructor(private readonly textService: TextService) {}

  @Post()
  create(@Body() dto: CreateTextDto) {
    return this.textService.create(dto);
  }

  @Post('bulk')
  createMany(@Body() dtos: CreateTextDto[]) {
    return this.textService.createMany(dtos);
  }
}
