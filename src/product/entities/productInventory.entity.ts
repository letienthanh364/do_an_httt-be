import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, ManyToOne, JoinTable, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('ProductInventory', { schema: 'Production' })
export class ProductInventory {
    @JoinColumn({ name: 'ProductID' })
    @ManyToOne((type) => Product, (product) => product.productInventory)
    ProductID: Product;

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

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    ModifiedDate: Date;
}