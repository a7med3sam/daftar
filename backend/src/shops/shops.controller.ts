import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';

@ApiTags('Shops')
@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @ApiOperation({ summary: 'Get all shops' })
  @ApiOkResponse({ schema: { example: [{ id: 1, name: 'Al-Madina Supermarket', phone: '01012345678', notes: 'Near the main mosque' }] } })
  @Get()
  findAll() {
    return this.shopsService.findAll();
  }

  @ApiOperation({ summary: 'Get a shop with stats' })
  @ApiOkResponse({ schema: { example: { id: 1, name: 'Al-Madina Supermarket', phone: '01012345678', stats: { totalPurchases: 10, totalSpent: 1500, unpaidAmount: 500 } } } })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shopsService.getShopStats(id);
  }

  @ApiOperation({ summary: 'Create a new shop' })
  @ApiCreatedResponse({ schema: { example: { id: 1, name: 'Al-Madina Supermarket', phone: '01012345678' } } })
  @Post()
  create(@Body() dto: CreateShopDto) {
    return this.shopsService.create(dto);
  }

  @ApiOperation({ summary: 'Update a shop' })
  @ApiOkResponse({ schema: { example: { id: 1, name: 'Al-Madina Supermarket Updated' } } })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateShopDto) {
    return this.shopsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a shop' })
  @ApiOkResponse({ schema: { example: { id: 1, name: 'Al-Madina Supermarket' } } })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shopsService.remove(id);
  }
}
