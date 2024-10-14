import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { get } from 'http';
import { json } from 'stream/consumers';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findProducts(@Query('by') by: string, @Query('id') id?: number) {
    switch (by) {
      case 'subcat':
        return this.productService.findBySubCatID(id);
      case 'model':
        return this.productService.findByModelID(id);
      case 'active':
        return this.productService.findActiveProducts();
      case 'quantity':
        return this.productService.findSortedByQuantity();
      default:
        return this.productService.findAll();
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

}
