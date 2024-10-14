import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity('ProductListPriceHistory', { schema: 'Production' })
export class ProductListPriceHistory {
    @JoinColumn({ name: 'ProductID' })
    @ManyToOne((type) => Product, (product) => product.productListPriceHistory)
    product: Product;

    @PrimaryColumn({ type: 'datetime' })
    StartDate: Date;

    @Column({ type: 'datetime', nullable: true })
    EndDate: Date;

    @Column({ type: 'decimal', precision: 19, scale: 4 })
    ListPrice: number;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    ModifiedDate: Date;   
}