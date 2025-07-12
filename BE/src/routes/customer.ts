import { Elysia } from 'elysia';
import { CustomerService } from '../services/customer.service';
import { customerSchema } from '../utils/validation';

export const customerRouter = new Elysia({ prefix: '/customers' })
  .get('/', async ({ jwt, headers: { authorization }, query, set }) => {
    const user = await jwt.verify(authorization);
    
    if (!user) {
      set.status = 401;
      return { message: 'Unauthorized', error: true };
    }
    const { search, page, limit } = query;
    return await CustomerService.findAll({
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
      return await CustomerService.findById(id);
    } catch (error) {
      set.status = 404;
      return {
        message: error instanceof Error ? error.message : 'Customer tidak ditemukan',
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
      const validatedData = customerSchema.parse(body);
      const customer = await CustomerService.create(validatedData);
      set.status = 201;
      return {
        message: 'Customer berhasil dibuat',
        data: customer
      };
    } catch (error) {
      set.status = 400;
      return {
        message: error instanceof Error ? error.message : 'Gagal membuat customer',
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
      const validatedData = customerSchema.partial().parse(body);
      const customer = await CustomerService.update(id, validatedData);
      return {
        message: 'Customer berhasil diupdate',
        data: customer
      };
    } catch (error) {
      set.status = error instanceof Error && error.message.includes('tidak ditemukan') ? 404 : 400;
      return {
        message: error instanceof Error ? error.message : 'Gagal mengupdate customer',
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
      await CustomerService.delete(id);
      return {
        message: 'Customer berhasil dihapus'
      };
    } catch (error) {
      set.status = error instanceof Error && error.message.includes('tidak ditemukan') ? 404 : 400;
      return {
        message: error instanceof Error ? error.message : 'Gagal menghapus customer',
        error: true
      };
    }
  });