import { IsString, MaxLength } from 'class-validator';

export class CreateBuyerDto {
  @IsString()
  @MaxLength(100)
  name: string;
}
