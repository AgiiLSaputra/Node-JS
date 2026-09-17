/**
 * Prisma Extension: Soft Delete
 *
 * Mengubah semua operasi delete menjadi update (set deletedAt)
 * Model yang didukung: User, Ticket, Comment
 *
 * Cara kerja (Prisma v6 Extensions):
 * - delete() -> update({ deletedAt: new Date() })
 * - deleteMany() -> updateMany({ deletedAt: new Date() })
 * - findFirst/findMany/findUnique -> otomatis filter deletedAt IS NULL
 */

const { Prisma } = require("@prisma/client");

const SOFT_DELETE_MODELS = ["User", "Ticket", "Comment"];

function softDeleteExtension() {
  return Prisma.defineExtension({
    name: "softDelete",
    query: {
      $allModels: {
        async delete({ args, query, operation }) {
          // Get current model name from context
          const model = this.toString();
          if (!SOFT_DELETE_MODELS.includes(model)) {
            return query(args);
          }
          // Change delete -> update with deletedAt
          args.data = { deletedAt: new Date() };
          return query(args);
        },
        async deleteMany({ args, query }) {
          const model = this.toString();
          if (!SOFT_DELETE_MODELS.includes(model)) {
            return query(args);
          }
          args.data = { deletedAt: new Date() };
          return query(args);
        },
        async findMany({ args, query }) {
          const model = this.toString();
          if (!SOFT_DELETE_MODELS.includes(model)) {
            return query(args);
          }
          if (args.where) {
            if (args.where.deletedAt === undefined) {
              args.where.deletedAt = null;
            }
          } else {
            args.where = { deletedAt: null };
          }
          return query(args);
        },
        async findFirst({ args, query }) {
          const model = this.toString();
          if (!SOFT_DELETE_MODELS.includes(model)) {
            return query(args);
          }
          if (args.where) {
            if (args.where.deletedAt === undefined) {
              args.where.deletedAt = null;
            }
          } else {
            args.where = { deletedAt: null };
          }
          return query(args);
        },
        async findUnique({ args, query }) {
          const model = this.toString();
          if (!SOFT_DELETE_MODELS.includes(model)) {
            return query(args);
          }
          if (args.where) {
            if (args.where.deletedAt === undefined) {
              args.where.deletedAt = null;
            }
          } else {
            args.where = { deletedAt: null };
          }
          return query(args);
        },
      },
    },
  });
}

module.exports = softDeleteExtension;
