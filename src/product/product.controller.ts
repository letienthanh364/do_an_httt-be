import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { get } from 'http';
import { json } from 'stream/consumers';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductCostHistory } from './entities/productCostHistory.entity';
import { Product } from './entities/product.entity';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'Get products by filters (ProductSubCategoryID, ProductModelID, active status), or sorted (total quantity, modified date DESC)' })
  @ApiResponse({
    status: 200,
    description: 'Return an array of products filtered/sorted by the given parameters',
    type: [Product],
  })
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
}
