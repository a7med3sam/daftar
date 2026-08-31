import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';

import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

@ApiTags('Shops')
@UseGuards(JwtAuthGuard)
@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @ApiOperation({ summary: 'Get all shops' })
  @ApiOkResponse({
    schema: {
      example: [
        {
          id: 1,
          name: 'Al-Madina Supermarket',
          phone: '01012345678',
          notes: 'Near the main mosque',
        },
      ],
    },
  })
  @Get()
  findAll() {
    return this.shopsService.findAll();
  }

  @ApiOperation({ summary: 'Get a shop with stats' })
  @ApiOkResponse({
    schema: {
      example: {
        id: 1,
        name: 'Al-Madina Supermarket',
        phone: '01012345678',
        stats: { totalPurchases: 10, totalSpent: 1500, unpaidAmount: 500 },
      },
    },
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shopsService.getShopStats(id);
  }

  @ApiOperation({ summary: 'Create a new shop' })
  @ApiCreatedResponse({
    schema: {
      example: { id: 1, name: 'Al-Madina Supermarket', phone: '01012345678' },
    },
  })
  @Post()
  create(@Body() dto: CreateShopDto, @CurrentUser() user: AuthUser) {
    return this.shopsService.create(dto, user);
  }

  @ApiOperation({ summary: 'Update a shop' })
  @ApiOkResponse({
    schema: { example: { id: 1, name: 'Al-Madina Supermarket Updated' } },
  })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShopDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.shopsService.update(id, dto, user);
  }

  @ApiOperation({ summary: 'Delete a shop' })
  @ApiOkResponse({
    schema: { example: { id: 1, name: 'Al-Madina Supermarket' } },
  })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.shopsService.remove(id, user);
  }
}
