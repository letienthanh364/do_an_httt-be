import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, ManyToOne, JoinTable, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('ProductInventory', { schema: 'Production' })
export class ProductInventory {
    @PrimaryColumn()
    ProductID: number;

    @PrimaryColumn()
    LocationID: number;

    @Column()
    Shelf: string;

    @Column()
    Bin: number;

    @Column()
    Quantity: number;

    @Column('uuid')
    rowguid: string;

    @Column()
    ModifiedDate: Date;

    @ManyToOne((type) => Product, (product) => product.productInventory)
    product: Product;
}