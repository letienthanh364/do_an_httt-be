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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductCostHistory } from './entities/productCostHistory.entity';
import { ProductListPriceHistory } from './entities/productListPriceHistory.entity';
import { ProductInventory } from './entities/productInventory.entity';
import { Location } from './entities/location.entity';

@ApiTags('product')
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
