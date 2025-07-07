import { Elysia, t } from 'elysia';
import { InvoiceService } from '../services/invoice.service';
import { invoiceSchema } from '../utils/validation';
import { isAuthenticated } from '../middleware/auth';

export const invoiceRouter = new Elysia({ prefix: '/invoices' })
  .use(isAuthenticated)
  .get('/', async ({ query }) => {
    const {
      search,
      status,
      customerId,
      startDate,
      endDate,
      page,
      limit
    } = query;

    return await InvoiceService.findAll({
      search: search as string,
      status: status as string,
      customerId: customerId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: Number(page) || 1,
      limit: Number(limit) || 10
    });
  })
  .get('/:id', async ({ params: { id }, set }) => {
    try {
      return await InvoiceService.findById(id);
    } catch (error) {
      set.status = 404;
      return {
        message: error instanceof Error ? error.message : 'Invoice tidak ditemukan',
        error: true
      };
    }
  })
  .post('/', async ({ body, set }) => {
    try {
      const validatedData = invoiceSchema.parse(body);
      const invoice = await InvoiceService.create({
        ...validatedData,
        issueDate: new Date(validatedData.issueDate),
        dueDate: new Date(validatedData.dueDate)
      });
      set.status = 201;
      return {
        message: 'Invoice berhasil dibuat',
        data: invoice
      };
    } catch (error) {
      set.status = 400;
      return {
        message: error instanceof Error ? error.message : 'Gagal membuat invoice',
        error: true
      };
    }
  }, {
    body: t.Object({
      customerId: t.String(),
      issueDate: t.String(),
      dueDate: t.String(),
      status: t.String(),
      items: t.Array(t.Object({
        productId: t.String(),
        quantity: t.Number(),
        price: t.Number(),
        description: t.Optional(t.String())
      })),
      notes: t.Optional(t.String())
    })
  })
  .put('/:id', async ({ params: { id }, body, set }) => {
    try {
      const validatedData = invoiceSchema.partial().parse(body);
      const invoice = await InvoiceService.update(id, {
        ...validatedData,
        issueDate: validatedData.issueDate ? new Date(validatedData.issueDate) : undefined,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined
      });
      return {
        message: 'Invoice berhasil diupdate',
        data: invoice
      };
    } catch (error) {
      set.status = error instanceof Error && error.message.includes('tidak ditemukan') ? 404 : 400;
      return {
        message: error instanceof Error ? error.message : 'Gagal mengupdate invoice',
        error: true
      };
    }
  }, {
    body: t.Partial(t.Object({
      customerId: t.String(),
      issueDate: t.String(),
      dueDate: t.String(),
      status: t.String(),
      items: t.Array(t.Object({
        productId: t.String(),
        quantity: t.Number(),
        price: t.Number(),
        description: t.Optional(t.String())
      })),
      notes: t.Optional(t.String())
    }))
  })
  .delete('/:id', async ({ params: { id }, set }) => {
    try {
      await InvoiceService.delete(id);
      return {
        message: 'Invoice berhasil dihapus'
      };
    } catch (error) {
      set.status = error instanceof Error && error.message.includes('tidak ditemukan') ? 404 : 400;
      return {
        message: error instanceof Error ? error.message : 'Gagal menghapus invoice',
        error: true
      };
    }
  })
  .put('/:id/status', async ({ params: { id }, body, set }) => {
    try {
      if (!body.status || typeof body.status !== 'string') {
        set.status = 400;
        return {
          message: 'Status invoice tidak valid',
          error: true
        };
      }

      const allowedStatuses = ['draft', 'sent', 'paid', 'cancelled'];
      if (!allowedStatuses.includes(body.status)) {
        set.status = 400;
        return {
          message: 'Status invoice tidak valid',
          error: true
        };
      }

      const invoice = await InvoiceService.updateStatus(id, body.status);
      return {
        message: 'Status invoice berhasil diupdate',
        data: invoice
      };
    } catch (error) {
      set.status = error instanceof Error && error.message.includes('tidak ditemukan') ? 404 : 400;
      return {
        message: error instanceof Error ? error.message : 'Gagal mengupdate status invoice',
        error: true
      };
    }
  }, {
    body: t.Object({
      status: t.String()
    })
  });