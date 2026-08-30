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
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PurchasesService } from './purchases.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('Purchases')
@Controller('purchases')
export class PurchasesController {
  constructor(
    private readonly purchasesService: PurchasesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @ApiOperation({ summary: 'Get all purchases' })
  @ApiOkResponse({ schema: { example: [{ id: 1, shopId: 1, buyerId: 1, totalAmount: 150.50, paymentStatus: 'UNPAID' }] } })
  @Get()
  findAll() {
    return this.purchasesService.findAll();
  }

  @ApiOperation({ summary: 'Get a single purchase by ID' })
  @ApiOkResponse({ schema: { example: { id: 1, shopId: 1, buyerId: 1, totalAmount: 150.50, paymentStatus: 'UNPAID', shop: { name: 'Al-Madina' }, buyer: { name: 'Ahmed Ali' }, images: [] } } })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.purchasesService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new purchase' })
  @ApiCreatedResponse({ schema: { example: { id: 1, shopId: 1, buyerId: 1, totalAmount: 150.50, paymentStatus: 'UNPAID' } } })
  @Post()
  create(@Body() dto: CreatePurchaseDto) {
    return this.purchasesService.create(dto);
  }

  @ApiOperation({ summary: 'Update a purchase' })
  @ApiOkResponse({ schema: { example: { id: 1, shopId: 1, buyerId: 1, totalAmount: 150.50, paymentStatus: 'PAID' } } })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePurchaseDto,
  ) {
    return this.purchasesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a purchase' })
  @ApiOkResponse({ schema: { example: { id: 1, shopId: 1, buyerId: 1, totalAmount: 150.50 } } })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.purchasesService.remove(id);
  }

  @ApiOperation({ summary: 'Upload images to a purchase' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } } } })
  @ApiQuery({ name: 'isReceipt', required: false, type: 'boolean' })
  @ApiCreatedResponse({ schema: { example: [{ id: 1, url: 'https://res.cloudinary.com/...', purchaseId: 1, isReceipt: false }] } })
  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('isReceipt') isReceiptQuery?: string,
  ) {
    const results: any[] = [];
    const isReceipt = isReceiptQuery === 'true';
    for (const file of files) {
      const url = await this.cloudinaryService.uploadImage(file.buffer);
      const image = await this.purchasesService.addImageUrl(id, url, isReceipt);
      results.push(image);
    }
    return results;
  }

  @ApiOperation({ summary: 'Remove an image from a purchase' })
  @ApiOkResponse({ schema: { example: { id: 1, url: 'https://res.cloudinary.com/...', purchaseId: 1, isReceipt: false } } })
  @Delete('images/:imageId')
  removeImage(@Param('imageId', ParseIntPipe) imageId: number) {
    return this.purchasesService.removeImage(imageId);
  }
}
