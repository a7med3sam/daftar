import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PurchasesService } from './purchases.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';

import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Purchases')
@UseGuards(JwtAuthGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(
    private readonly purchasesService: PurchasesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @ApiOperation({ summary: 'Get all purchases' })
  @ApiOkResponse({
    schema: {
      example: [
        {
          id: 1,
          shopId: 1,
          buyerId: 1,
          totalAmount: 150.5,
          paymentStatus: 'UNPAID',
        },
      ],
    },
  })
  @Get()
  findAll() {
    return this.purchasesService.findAll();
  }

  @ApiOperation({ summary: 'Get a single purchase by ID' })
  @ApiOkResponse({
    schema: {
      example: {
        id: 1,
        shopId: 1,
        buyerId: 1,
        totalAmount: 150.5,
        paymentStatus: 'UNPAID',
        shop: { name: 'Al-Madina' },
        buyer: { name: 'Ahmed Ali' },
        images: [],
      },
    },
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.purchasesService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new purchase' })
  @ApiCreatedResponse({
    schema: {
      example: {
        id: 1,
        shopId: 1,
        buyerId: 1,
        totalAmount: 150.5,
        paymentStatus: 'UNPAID',
      },
    },
  })
  @Post()
  create(@Body() dto: CreatePurchaseDto, @CurrentUser() user: AuthUser) {
    return this.purchasesService.create(dto, user);
  }

  @ApiOperation({ summary: 'Update a purchase' })
  @ApiOkResponse({
    schema: {
      example: {
        id: 1,
        shopId: 1,
        buyerId: 1,
        totalAmount: 150.5,
        paymentStatus: 'PAID',
      },
    },
  })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePurchaseDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.purchasesService.update(id, dto, user);
  }

  @ApiOperation({ summary: 'Delete a purchase' })
  @ApiOkResponse({
    schema: { example: { id: 1, shopId: 1, buyerId: 1, totalAmount: 150.5 } },
  })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.purchasesService.remove(id, user);
  }

  @ApiOperation({ summary: 'Upload images to a purchase' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @ApiQuery({ name: 'isReceipt', required: false, type: 'boolean' })
  @ApiCreatedResponse({
    schema: {
      example: [
        {
          id: 1,
          url: 'https://res.cloudinary.com/...',
          purchaseId: 1,
          isReceipt: false,
        },
      ],
    },
  })
  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('isReceipt') isReceiptQuery?: string,
  ) {
    const isReceipt = isReceiptQuery === 'true';
    const uploadPromises = files.map(async (file) => {
      const url = await this.cloudinaryService.uploadImage(file.buffer);
      return this.purchasesService.addImageUrl(id, url, isReceipt);
    });

    const results = await Promise.all(uploadPromises);
    return results;
  }

  @ApiOperation({ summary: 'Remove an image from a purchase' })
  @ApiOkResponse({
    schema: {
      example: {
        id: 1,
        url: 'https://res.cloudinary.com/...',
        purchaseId: 1,
        isReceipt: false,
      },
    },
  })
  @Delete('images/:imageId')
  removeImage(@Param('imageId', ParseIntPipe) imageId: number) {
    return this.purchasesService.removeImage(imageId);
  }
}
