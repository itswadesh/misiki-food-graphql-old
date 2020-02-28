const { ObjectId } = require('mongodb');
import Color from '../color/model'
import Product from '../product/product.model'
import { pageSize } from '../../config';
const toJson = (str: string) => {
    try {
        return JSON.parse(str);
    } catch (err) {
        return str;
    }
}
export const sortVariants = async (pid) => {
    try {
        const result = await Product.update(
            { _id: ObjectId(pid) },
            {
                $push: {
                    variants: {
                        $each: [],
                        $sort: { sort: 1 }
                    }
                }
            },
            { "multi": true })
        return result
    }
    catch (e) {
        throw e
    }
}
export const constructQuery = ({ q, search, predicate, forAdmin }) => {
    let f = [],
        Ids = null, where: any = {};
    for (let i in q) {
        if (i == 'page' || i == 'limit' || i == 'skip' || i == 'sort') continue
        Ids = q[i];
        if (Ids && Ids.split(",").length > 0) { //  && i != 1
            Ids = Ids.replace(/\/$/, "") // To remove trailing slash
            // if (i == "sort") {
            //   this.fl[i] = Ids; // Required: else the sort radio text removes: when sort value
            // } else {
            //   this.fl[i] = Ids.split(",");
            // }
            if (i == "brands" && predicate != 'brands') {
                f.push({ brandName: { $in: Ids.split(",") } });
            } else if (i == "categories" && predicate != 'categories') {
                f.push({ "categories.slug": { $in: Ids.split(",") } });
            } else if (i == "sizes" && predicate != 'sizes') {
                f.push({ "variants.size": { $in: Ids.split(",") } });
            } else if (i == "price" && predicate != 'price') {
                f.push({
                    "variants.price": {
                        $gt: Ids.split(",")[0],
                        $lt: Ids.split(",")[1]
                    }
                });
            } else if (i == "sort") {
                q.sort = Ids;
            } else if (i == "vendor_name") {
                f.push({ "vendor_name": Ids });
            } else if (i == "sku") {
                f.push({ "sku": { $regex: '.*' + Ids + '.*', $options: 'i' } });
            }
            else if (i == "name") {
                f.push({ "name": { $regex: '.*' + Ids + '.*', $options: 'i' } });
            }
            else if (i == "vendor_id") {
                f.push({ "vendor_id": Ids });
            }
            else if (predicate != 'brands' && predicate != 'categories' && predicate != 'sizes' && predicate != 'price' && predicate != 'vendor_name') {
                if (i == 'Color') {
                    f.push({
                        "features.key": i,
                        "features.val": { $in: Ids.split(",") }
                    });
                }
            }
        }
    }
    if (f.length > 0) {
        where = { $and: f };
    } else {
        where = {};
    }
    let limit = pageSize
    let skip = 0
    if (q.page) {
        limit = pageSize
        skip = (parseInt(q.page) - 1) * pageSize
    }
    let sort = q.sort || null//{ score: { $meta: "textScore" } }
    if (!forAdmin) {
        where.active = true; where.approved = true;
        where['variants.stock'] = { $gt: 0 }
    }
    let searchString = where
    if (search != 'null' && !!search)
        searchString = { ...where, $text: { $search: search } }
    return { where: searchString, limit, skip, sort }
}
export const checkProductId = async (_id, promotions) => {
    try {
        // let promotions = await Promotion.find({ type: 'product', active: true, validFromDate: { $lte: new Date() }, validToDate: { $gte: new Date() } }).select('description condition productCondition action validFromDate validToDate').sort('priority')
        let product, offer, condition
        for (let o of promotions) {
            condition = o.productCondition
            try {
                condition = JSON.parse(o.productCondition)
            } catch (e) { } // If already json
            condition._id = _id
            product = await Product.findOne(condition).select('_id name slug img imgUrls new hot sale brand brandName brandSlug variants._id variants.size variants.img variants.price variants.mrp variants.offer')
            if (product) {
                product.variants.map(v => {
                    if (o.action.key == 'Discount' && o.action.type == 'Percent') {
                        v.offer = Math.round(v.price - v.price * parseInt(o.action.val) / 100)
                    } else if (o.action.key == 'Discount' && o.action.type == 'Fixed') {
                        v.offer = Math.round(v.price - parseInt(o.action.val))
                    } else {
                        v.offer = 0
                    }
                })
                offer = o
                break
            }
        }
        if (offer)
            product.offer = offer

        return product
    } catch (e) {
        return e.toString()
    }
}
export const checkProductIdV = async (pid, vid, promotions) => {
    try {
        let product, variant, offer
        for (let o of promotions) {
            let condition: any = {}
            try {
                condition = JSON.parse(o.productCondition)
            } catch (e) { }
            condition._id = pid
            product = await Product.findOne(condition).select('_id name slug img imgUrls new hot sale brand brandName brandSlug variants._id variants.size  variants.img variants.price variants.mrp variants.offer')
            if (product) {
                variant = product.variants.id(vid);
                if (o.action.key == 'Discount' && o.action.type == 'Percent') {
                    variant.offer = Math.round(variant.price - variant.price * parseInt(o.action.val) / 100)
                } else if (o.action.key == 'Discount' && o.action.type == 'Fixed') {
                    variant.offer = Math.round(variant.price - parseInt(o.action.val))
                } else {
                    variant.offer = 0
                }
                offer = o
                break
            }
        }
        // if (offer)
        //   product.offer = offer

        return { product, variant, offer }
    } catch (e) {
        return e.toString()
    }
}
export const appliedFilters = async (req) => {
    try {
        let brands = [], sizes = [], features = [], categories = [], price = [];
        let searchString: any = {}, brandSearchString: any = { where: {} }, sizeSearchString: any = { where: {} }, featureSearchString: any = { where: {} }, categorySearchString: any = { where: {} }, priceSearchString: any = { where: {} };
        let query = toJson(req.query)
        query.brands = query.brands || ''
        query.sizes = query.sizes || ''
        query.categories = query.categories || ''
        query.sizes = query.sizes || ''
        for (let r in query) {
            if (r == 'page' || r == 'limit' || r == 'skip' || r == 'sort') continue
            // searchString = this.constructQuery({ q: toJson(req.query), search: req.params.search, predicate: r });
            // log('prices search string...', chalk.yellow(JSON.stringify(searchString.where)));
            if (r == 'brands') {
                brandSearchString = constructFacets({ q: query, search: req.params.search, predicate: r });
            }
            else if (r == 'categories') {
                categorySearchString = constructFacets({ q: query, search: req.params.search, predicate: r });
            }
            else if (r == 'sizes') {
                sizeSearchString = constructFacets({ q: query, search: req.params.search, predicate: r });
                // log('sizes search string...', chalk.yellow(JSON.stringify(sizeSearchString.where)));
            } else {
                featureSearchString = constructFacets({ q: query, search: req.params.search, predicate: r });
                // console.log('........... search string...', JSON.stringify(featureSearchString.where));
            }
        }
        brands = await Product.aggregate([
            { $match: brandSearchString.where },
            { "$sort": { "brandName": 1, "updatedAt": -1 } },
            {
                "$group": {
                    "_id": "$brandName",
                    "name": { "$first": "$brandName" },
                    "val": { "$first": "$brandSlug" }
                }
            }
        ])
        const priceRes = await Product.aggregate([
            { $match: priceSearchString.where },
            {
                $group: {
                    _id: null,
                    min: { $min: "$variants.price" },
                    max: { $max: "$variants.price" }
                }
            }
        ])
        price = [priceRes[0].min[0] || 0, priceRes[0].max[0] || 100000]
        sizes = await Product.aggregate([
            { $match: sizeSearchString.where },
            { $unwind: '$variants' },
            { $match: { 'variants.stock': { $gt: 0 } } },
            { $group: { _id: '$variants.size', name: { $max: '$variants.size' }, count: { $sum: 1 } } }
        ])
        features = await Product.aggregate([
            { $match: featureSearchString.where },
            { $unwind: '$features' },
            { $project: { key: '$features.key', val: '$features.val' } },
            {
                $group: {
                    _id: '$key',
                    name: { $max: "$key" },
                    options: { $addToSet: { name: "$val" } }
                }
            }
        ])
        return { brands, sizes, features, price }
    } catch (e) {
        throw e.toString()
    }
}
export const attachColor = async (colorObj) => {
    if (colorObj && colorObj.name) {
        try {
            const colorName = colorObj.name.charAt(0).toUpperCase() + colorObj.name.substr(1).toLowerCase()
            const color = await Color.findOne({ name: colorName })
            if (color)
                return color
            else {
                try {
                    return await Color.create(colorObj)
                } catch (e) { // When no color name specified 
                    // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', e.toString());
                    return
                }
            }
        } catch (e) {
            return colorObj
        }
    } else if (colorObj) { // When color: 'Blue' instead of color: {name:'Blue'}
        throw 'Color not found.'
    }
    else {
        return
    }
}
export const constructFacets = ({ q, search, predicate }) => {
    let f = [],
        Ids = null, where: any = {}, s = {};
    for (let i in q) {
        if (i == 'page' || i == 'limit' || i == 'skip' || i == 'sort') continue
        Ids = q[i];
        if (Ids && Ids.split(",").length > 0) { //  && i != 1
            // if (i == "sort") {
            //   this.fl[i] = Ids; // Required: else the sort radio text removes: when sort value
            // } else {
            //   this.fl[i] = Ids.split(",");
            // }
            if (i == 'brands') {
                if (predicate != "brands")
                    f.push({ brandName: { $in: Ids.split(",") } })
            } else if (i == "categories") {
                if (predicate != "categories")
                    f.push({ "categories.slug": { $in: Ids.split(",") } })
            } else if (i == "sizes") {
                if (predicate != "sizes")
                    f.push({ "variants.size": { $in: Ids.split(",") } })
            } else if (i == "price") {
                if (predicate != "price")
                    f.push({
                        "variants.price": {
                            $gt: Ids.split(",")[0],
                            $lt: Ids.split(",")[1]
                        }
                    })
            } else if (i == "sort" && predicate != 'sort') {
                q.sort = Ids;
            } else if (i != 'brands' && i != 'categories' && i != 'sizes' && i != 'price' && i != 'sort') {
                if (i != predicate) {
                    f.push({
                        "features.key": i,
                        "features.val": { $in: Ids.split(",") }
                    });
                }
            }
        }
    }
    if (f.length > 0) {
        where = { $and: f };
    } else {
        where = {};
    }
    // log(chalk.red(JSON.stringify(where)));
    let limit = 18
    let skip = 0
    if (q.page) {
        limit = pageSize
        skip = (parseInt(q.page) - 1) * pageSize
    }
    let sort = q.sort || { score: { $meta: "textScore" } }
    where.active = true; where.approved = true;
    where['variants.stock'] = { $gt: 0 }
    let searchString = where
    if (search != 'null')
        searchString = { ...where, $text: { $search: search } }
    return { where: searchString, limit, skip, sort }
}
