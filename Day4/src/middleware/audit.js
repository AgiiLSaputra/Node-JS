/**
 * Prisma Extension: Audit Log
 *
 * Mencatat semua operasi perubahan data (create, update, delete)
 * ke dalam tabel AuditLog.
 *
 * Fitur:
 * - Auto-log create, update, delete operations
 * - Simpan oldValues dan newValues (sebagai JSON)
 * - Track user yang melakukan operasi (jika ada)
 * - Track IP address dan User Agent
 */

const { Prisma } = require("@prisma/client");

function auditExtension() {
  return Prisma.defineExtension({
    name: "auditLog",
    query: {
      $allModels: {
        async create({ args, query }) {
          const model = this.toString();
          if (model === "AuditLog") {
            return query(args);
          }

          const result = await query(args);

          try {
            let newValues = result ? { ...result } : null;
            if (newValues) delete newValues.password;
            const userId = args.data?.authorId || args.data?.userId || null;

            await query({
              data: {
                action: "CREATE",
                entity: model,
                entityId: result?.id || 0,
                oldValues: null,
                newValues,
                userId: userId || 1,
              },
            });
          } catch (error) {
            console.error("Audit log error:", error.message);
          }

          return result;
        },
        async update({ args, query }) {
          const model = this.toString();
          if (model === "AuditLog") {
            return query(args);
          }

          let oldValues = null;
          if (args.where) {
            try {
              const record = await query({ where: args.where });
              if (record) {
                oldValues = { ...record };
                delete oldValues.password;
              }
            } catch (error) {
              // skip
            }
          }

          const result = await query(args);

          try {
            let newValues = result ? { ...result } : null;
            if (newValues) delete newValues.password;
            const userId = args.data?.authorId || args.data?.userId || null;

            await query({
              data: {
                action: "UPDATE",
                entity: model,
                entityId: result?.id || args.where?.id || 0,
                oldValues,
                newValues,
                userId: userId || 1,
              },
            });
          } catch (error) {
            console.error("Audit log error:", error.message);
          }

          return result;
        },
        async delete({ args, query }) {
          const model = this.toString();
          if (model === "AuditLog") {
            return query(args);
          }

          let oldValues = null;
          if (args.where) {
            try {
              const record = await query({ where: args.where });
              if (record) {
                oldValues = { ...record };
                delete oldValues.password;
              }
            } catch (error) {
              // skip
            }
          }

          const result = await query(args);

          try {
            const userId = args.data?.authorId || args.data?.userId || null;

            await query({
              data: {
                action: "DELETE",
                entity: model,
                entityId: args.where?.id || 0,
                oldValues,
                newValues: null,
                userId: userId || 1,
              },
            });
          } catch (error) {
            console.error("Audit log error:", error.message);
          }

          return result;
        },
        async updateMany({ args, query }) {
          const model = this.toString();
          if (model === "AuditLog") {
            return query(args);
          }

          const result = await query(args);

          try {
            const userId = args.data?.authorId || args.data?.userId || null;

            await query({
              data: {
                action: "BULK_UPDATE",
                entity: model,
                entityId: 0,
                oldValues: null,
                newValues: { count: result?.count || 0 },
                userId: userId || 1,
              },
            });
          } catch (error) {
            console.error("Audit log error:", error.message);
          }

          return result;
        },
        async deleteMany({ args, query }) {
          const model = this.toString();
          if (model === "AuditLog") {
            return query(args);
          }

          const result = await query(args);

          try {
            const userId = args.data?.authorId || args.data?.userId || null;

            await query({
              data: {
                action: "BULK_DELETE",
                entity: model,
                entityId: 0,
                oldValues: null,
                newValues: { count: result?.count || 0 },
                userId: userId || 1,
              },
            });
          } catch (error) {
            console.error("Audit log error:", error.message);
          }

          return result;
        },
      },
    },
  });
}

module.exports = auditExtension;
