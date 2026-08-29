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

export class CreatePurchaseDto {
  @IsInt()
  shopId: number;

  @IsInt()
  buyerId: number;

  @IsDateString()
  purchaseDate: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  totalAmount: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsInt()
  paidById?: number;

  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
