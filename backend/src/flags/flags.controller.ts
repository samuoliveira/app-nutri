import { Body, Controller, Get, Param, Put } from '@nestjs/common';

import { SetFlagDto } from './dto/set-flag.dto';
import { FlagsService, type FlagKey } from './flags.service';

@Controller('flags')
export class FlagsController {
  constructor(private readonly service: FlagsService) {}

  @Get()
  snapshot(): Promise<Record<FlagKey, boolean>> {
    return this.service.snapshot();
  }

  @Put(':key')
  set(@Param('key') key: string, @Body() dto: SetFlagDto): Promise<Record<FlagKey, boolean>> {
    return this.service.set(key, dto.enabled);
  }
}
