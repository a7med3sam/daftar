import {
  IsInt,
  IsDateString,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';
import { PaymentStatus } from '@prisma/client';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseDto {
  @ApiProperty({ example: 1, description: 'The ID of the shop' })
  @IsInt()
  shopId: number;

  @ApiProperty({ example: 1, description: 'The ID of the buyer' })
  @IsInt()
  buyerId: number;

  @ApiProperty({ example: '2023-10-27T10:00:00Z', description: 'The date of the purchase' })
  @IsDateString()
  purchaseDate: string;

  @ApiProperty({ example: 150.50, description: 'The total amount of the purchase' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  totalAmount: number;

  @ApiPropertyOptional({ example: 50.00, description: 'The amount already paid' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  paidAmount?: number;

  @ApiPropertyOptional({ enum: PaymentStatus, example: PaymentStatus.PARTIALLY_PAID, description: 'The payment status' })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ example: 1, description: 'The ID of the buyer who paid (if applicable)' })
  @IsOptional()
  @IsInt()
  paidById?: number;

  @ApiPropertyOptional({ example: '2023-10-27T10:00:00Z', description: 'The date when the payment was made' })
  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
