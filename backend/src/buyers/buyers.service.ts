import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';

@Injectable()
export class BuyersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.buyer.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const buyer = await this.prisma.buyer.findUnique({ where: { id } });
    if (!buyer) throw new NotFoundException(`المشتري رقم ${id} غير موجود`);
    return buyer;
  }

  async create(dto: CreateBuyerDto) {
    return this.prisma.buyer.create({ data: dto });
  }

  async update(id: number, dto: UpdateBuyerDto) {
    await this.findOne(id);
    return this.prisma.buyer.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.buyer.delete({ where: { id } });
  }
}
