import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BuyersService } from './buyers.service';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Buyers')
@Controller('buyers')
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  @ApiOperation({ summary: 'Get all buyers' })
  @ApiOkResponse({ schema: { example: [{ id: 1, name: 'Ahmed Ali', imageUrl: null }] } })
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

  @ApiOperation({ summary: 'Upload buyer profile image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('الملف مطلوب');
    return this.buyersService.uploadImage(id, file.buffer);
  }

  @ApiOperation({ summary: 'Delete a buyer' })
  @ApiOkResponse({ schema: { example: { id: 1, name: 'Ahmed Ali' } } })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.buyersService.remove(id);
  }
}
