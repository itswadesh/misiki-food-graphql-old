db.products.find({}).forEach(function (items) {
    var newItems = [];
    items.img.forEach(function (v) {
        v = v.original
        newItems.push(v);
    });

    db.products.update(
        { _id: items._id },
        { "$set": { img: newItems } }
    );
})