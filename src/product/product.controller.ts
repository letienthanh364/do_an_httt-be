import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { get } from 'http';
import { json } from 'stream/consumers';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get('id/:id')
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

  @Get('newest')
  findNewestProducts() {
    return this.productService.findByNewestDate();
  }

  @Get(':id/cost-history')
  async listCostHistoryOfProduct(@Param('id') productId: number) {
    return await this.productService.listCostHistoryOfProduct(productId);
  }

  @Get(':id/price-history')
  async listPriceHistoryOfProduct(@Param('id') productId: number) {
    return await this.productService.listPriceHistoryOfProduct(productId);
  }

  @Get(':id/inventory')
  async listProductInventories(@Param('id') productId: number) {
    return await this.productService.listInventoriesByProductId(productId);
  }

  @Get(':id/stats')
  async getProductStats(@Param('id') productId: number) {
    return await this.productService.getProductStats(productId);
  }

  @Get(':id/purchase-stats')
  async getProductPurchaseStats(@Param('id') productId: number) {
    return await this.productService.getProductPurchaseStats(productId);
  }
}
