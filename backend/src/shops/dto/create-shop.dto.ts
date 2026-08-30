import { IsString, IsOptional, MaxLength } from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShopDto {
  @ApiProperty({ example: 'Al-Madina Supermarket', description: 'The name of the shop' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: '01012345678', description: 'The phone number of the shop' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'Near the main mosque', description: 'Additional notes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
