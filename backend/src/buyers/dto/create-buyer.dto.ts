import { IsString, MaxLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateBuyerDto {
  @ApiProperty({ example: 'Ahmed Ali', description: 'The name of the buyer' })
  @IsString()
  @MaxLength(100)
  name: string;
}
