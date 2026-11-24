import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isMongoDBConfigured } from '../../../lib/mongodb';
import { Product } from '../../../models/Product';
import { InventoryMovement } from '../../../models/InventoryMovement';
import { AuditLog } from '../../../models/AuditLog';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!isMongoDBConfigured()) {
      return NextResponse.json({ success: true, data: { items: [], movements: [], summary: {} } });
    }

    await connectToDatabase();

    const products = await Product.find({}).sort({ stockQuantity: 1 }).lean();
    const movements = await InventoryMovement.find({}).sort({ createdAt: -1 }).limit(50).lean();

    const totalStock = products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
    const lowStockItems = products.filter((p) => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= 5);
    const outOfStockItems = products.filter((p) => (p.stockQuantity || 0) <= 0);

    return NextResponse.json({
      success: true,
      data: {
        items: products.map((p: any) => ({
          ...p,
          id: p._id.toString(),
        })),
        movements: movements.map((m: any) => ({
          ...m,
          id: m._id.toString(),
        })),
        summary: {
          totalProducts: products.length,
          totalStock,
          lowStockCount: lowStockItems.length,
          outOfStockCount: outOfStockItems.length,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, quantityChange, movementType, reason, adminEmail } = body;

    if (!productId || quantityChange === undefined || !reason) {
      return NextResponse.json({ error: 'Missing required inventory adjustment fields' }, { status: 400 });
    }

    if (!isMongoDBConfigured()) {
      return NextResponse.json({ success: true, message: 'Stock adjusted (offline)' });
    }

    await connectToDatabase();

    const query = mongoose.Types.ObjectId.isValid(productId) ? { _id: productId } : { sku: productId };
    const product = await Product.findOne(query);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const previousStock = product.stockQuantity || 0;
    const change = Number(quantityChange);
    const newStock = Math.max(0, previousStock + change);

    product.stockQuantity = newStock;
    await product.save();

    // Record movement
    const movement = await InventoryMovement.create({
      productId: product._id.toString(),
      productName: product.name,
      movementType: movementType || (change >= 0 ? 'restock' : 'adjustment'),
      quantityChange: change,
      previousStock,
      newStock,
      reason,
      adminEmail: adminEmail || 'qazeembasitoladimeji@gmsail.com',
    });

    // Record audit log
    await AuditLog.create({
      adminEmail: adminEmail || 'qazeembasitoladimeji@gmsail.com',
      adminName: 'Store Administrator',
      action: 'STOCK_ADJUSTMENT',
      entityType: 'inventory',
      entityId: product._id.toString(),
      details: `${product.name}: stock changed from ${previousStock} to ${newStock} (${change > 0 ? '+' : ''}${change}). Reason: ${reason}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        product: {
          ...product.toJSON(),
          id: product._id.toString(),
        },
        movement,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
