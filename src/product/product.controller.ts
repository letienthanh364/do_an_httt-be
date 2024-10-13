import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { get } from 'http';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Get('subcat/:id')
  findBySubCatID(@Param('id') id: string) {
    return this.productService.findBySubCatID(+id);
  }

  @Get('model/:id')
  findByModelID(@Param('id') id: string) {
    return this.productService.findByModelID(+id);
  }

  @Get('active')
  findActiveProducts() {
    return this.productService.findActiveProducts();
  }
}
