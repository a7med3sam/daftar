import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'عصام', description: 'اسم المستخدم' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'secret-password', description: 'كلمة المرور' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password: string;
}
