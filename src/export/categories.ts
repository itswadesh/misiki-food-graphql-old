import { exportCSV, toJson } from '../utils';
import { Category } from '../models';
export default async function (req: any, res: any) {
    const name = "categories";
    const sort = req.query.sort || "-updatedAt";
    const skip = parseInt(req.query.skip || 0);
    const limit = parseInt(req.query.limit || 30);
    const where = toJson(req.query.where) || {};
    if (req.query.search)
        where.q = { $regex: new RegExp(req.query.search, "ig") };
    try {
        let filePath = await exportCSV({
            name,
            model: Category,
            skip,
            limit,
            where,
            fields: [
                "_id",
                "index",
                "name",
                "slug", 'metaTitle', 'metaDescription', 'metaKeywords',
                "featured",
                "active"
            ]
        });
        res.download(filePath);
    } catch (e) {
        return res.status(500).send(e.toString());
    }
}