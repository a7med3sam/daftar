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
import { BuyersService } from './buyers.service';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';

import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';

@ApiTags('Buyers')
@Controller('buyers')
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  @ApiOperation({ summary: 'Get all buyers' })
  @ApiOkResponse({ schema: { example: [{ id: 1, name: 'Ahmed Ali', totalDebt: 100 }] } })
  @Get()
  findAll() {
    return this.buyersService.findAll();
  }

  @ApiOperation({ summary: 'Create a new buyer' })
  @ApiCreatedResponse({ schema: { example: { id: 1, name: 'Ahmed Ali' } } })
  @Post()
  create(@Body() dto: CreateBuyerDto) {
    return this.buyersService.create(dto);
  }

  @ApiOperation({ summary: 'Update a buyer' })
  @ApiOkResponse({ schema: { example: { id: 1, name: 'Ahmed Ali Updated' } } })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBuyerDto) {
    return this.buyersService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a buyer' })
  @ApiOkResponse({ schema: { example: { id: 1, name: 'Ahmed Ali' } } })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.buyersService.remove(id);
  }
}
