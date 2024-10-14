import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { get } from 'http';
import { json } from 'stream/consumers';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Product } from './entities/product.entity';
import { ProductCostHistory } from './entities/productCostHistory.entity';
import { ProductListPriceHistory } from './entities/productListPriceHistory.entity';
import { ProductInventory } from './entities/productInventory.entity';
import { Location } from './entities/location.entity';

@ApiTags('product')
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

  @ApiOperation({ summary: 'Get cost history of product' })
  @ApiResponse({
    status: 200,
    description: 'Return an array of cost history',
    type: [ProductCostHistory],
  })
  @Get(':id/cost-history')
  async listCostHistoryOfProduct(@Param('id') productId: number) {
    return await this.productService.listCostHistoryOfProduct(productId);
  }

  @ApiOperation({ summary: 'Get price history of product' })
  @ApiResponse({
    status: 200,
    description: 'Return an array of price history',
    type: [ProductListPriceHistory],
  })
  @Get(':id/price-history')
  async listPriceHistoryOfProduct(@Param('id') productId: number) {
    return await this.productService.listPriceHistoryOfProduct(productId);
  }

  @ApiOperation({ summary: 'Get the list of inventories of product' })
  @ApiResponse({
    status: 200,
    description:
      "Return an array of inventory objects including 'location' and 'quantity'",
    example: [
      {
        location: {
          Name: 'Frame Forming',
          CostRate: 22.5,
          Availability: 96,
          ModifiedDate: new Date(),
        } as Location,
        quantity: 2000,
      },
    ],
  })
  @Get(':id/inventory')
  async listProductInventories(@Param('id') productId: number) {
    return await this.productService.listInventoriesByProductId(productId);
  }

  @ApiOperation({ summary: 'Get stats of product' })
  @ApiResponse({
    status: 200,
    description:
      "Return the sums of 'order quantity', 'stocked quantity', 'scrapped quantity'",

    example: {
      orderQuantitySum: 1000,
      stockedQuantitySum: 2000,
      scrappedQuantitySum: 100,
    },
  })
  @Get(':id/stats')
  async getProductStats(@Param('id') productId: number) {
    return await this.productService.getProductStats(productId);
  }

  @ApiOperation({ summary: 'Get purchase stats of product' })
  @ApiResponse({
    status: 200,
    description:
      "Return the sums of 'received quantity', 'rejected quantity', 'stocked quantity' of purchases got from product",
    example: {
      receivedQuantitySum: 1000,
      rejectedQuantitySum: 2000,
      stockedQuantitySum: 100,
    },
  })
  @Get(':id/purchase-stats')
  async getProductPurchaseStats(@Param('id') productId: number) {
    return await this.productService.getProductPurchaseStats(productId);
  }
}
