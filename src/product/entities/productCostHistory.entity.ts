import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('ProductCostHistory', { schema: 'Production' })
export class ProductCostHistory {

    @JoinColumn({ name: 'ProductID' })
    @ManyToOne(() => Product, product => product.costHistories)
    product: Product;

    @PrimaryColumn({ type: 'datetime' })
    StartDate: Date;

    @Column({ type: 'datetime', nullable: true })
    EndDate: Date;

    @Column({ type: 'decimal', precision: 19, scale: 4 })
    StandardCost: number;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    ModifiedDate: Date;
}