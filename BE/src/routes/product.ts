import { Elysia } from 'elysia';
import { ProductService } from '../services/product.service';
import { productSchema } from '../utils/validation';

export const productRouter = new Elysia({ prefix: '/products' })
  .get('/', async ({ jwt, headers: { authorization }, query, set }) => {
    const user = await jwt.verify(authorization);
    
    if (!user) {
      set.status = 401;
      return { message: 'Unauthorized', error: true };
    }
    const { search, page, limit } = query;
    return await ProductService.findAll({
      search: search as string,
      page: Number(page) || 1,
      limit: Number(limit) || 10
    });
  })
  .get('/:id', async ({ jwt, headers: { authorization }, params: { id }, set }) => {
    const user = await jwt.verify(authorization);
    
    if (!user) {
      set.status = 401;
      return { message: 'Unauthorized', error: true };
    }
    try {
      return await ProductService.findById(id);
    } catch (error) {
      set.status = 404;
      return {
        message: error instanceof Error ? error.message : 'Produk tidak ditemukan',
        error: true
      };
    }
  })
  .post('/', async ({ jwt, headers: { authorization }, body, set }) => {
    const user = await jwt.verify(authorization);
    
    if (!user) {
      set.status = 401;
      return { message: 'Unauthorized', error: true };
    }
    try {
      const validatedData = productSchema.parse(body);
      const product = await ProductService.create(validatedData);
      set.status = 201;
      return {
        message: 'Produk berhasil dibuat',
        data: product
      };
    } catch (error) {
      set.status = 400;
      return {
        message: error instanceof Error ? error.message : 'Gagal membuat produk',
        error: true
      };
    }
  })
  .put('/:id', async ({ jwt, headers: { authorization }, params: { id }, body, set }) => {
    const user = await jwt.verify(authorization);
    
    if (!user) {
      set.status = 401;
      return { message: 'Unauthorized', error: true };
    }
    try {
      const validatedData = productSchema.partial().parse(body);
      const product = await ProductService.update(id, validatedData);
      return {
        message: 'Produk berhasil diupdate',
        data: product
      };
    } catch (error) {
      set.status = error instanceof Error && error.message.includes('tidak ditemukan') ? 404 : 400;
      return {
        message: error instanceof Error ? error.message : 'Gagal mengupdate produk',
        error: true
      };
    }
  })
  .delete('/:id', async ({ jwt, headers: { authorization }, params: { id }, set }) => {
    const user = await jwt.verify(authorization);
    
    if (!user) {
      set.status = 401;
      return { message: 'Unauthorized', error: true };
    }
    try {
      await ProductService.delete(id);
      return {
        message: 'Produk berhasil dihapus'
      };
    } catch (error) {
      set.status = error instanceof Error && error.message.includes('tidak ditemukan') ? 404 : 400;
      return {
        message: error instanceof Error ? error.message : 'Gagal menghapus produk',
        error: true
      };
    }
  });