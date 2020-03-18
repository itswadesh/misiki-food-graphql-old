// in
db.products.find({ imgUrls: { '$regex': 'shoppo', '$options': 'i' } })
    .projection({ imgUrls: 1 })
    .sort({ _id: -1 })
    .limit(100)

// Not in
db.products.find({ imgUrls: { '$regex': '^((?!shoppo).)*$', '$options': 'i' } })
    .projection({ imgUrls: 1 })
    .sort({ _id: -1 })
    .limit(100)

// Check duplicates
db.electronics.aggregate([
    {
        $group: {
            _id: { sku: "$sku" },
            uniqueIds: { $addToSet: "$_id" },
            count: { $sum: 1 }
        }
    },
    {
        $match: {
            count: { "$gt": 1 }
        }
    },
    {
        $sort: {
            count: -1
        }
    }
]);