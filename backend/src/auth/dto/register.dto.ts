import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'عصام',
    description: 'اسم المستخدم — يُستخدم أيضاً كمُعرّف تسجيل الدخول',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Matches(/^[^\s]+(\s[^\s]+)*$/, {
    message: 'لا يمكن أن يبدأ أو ينتهي الاسم بمسافة',
  })
  name: string;

  @ApiProperty({ example: 'secret-password', description: 'كلمة المرور' })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string;
}
