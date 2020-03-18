db.products.find({}).forEach(function (item) {
    item.variants.forEach(function (v) { //iterate over array element in the current doc
        // console.log(v);
        if (v.img)
            v.img[0] = '/images/product/' + item.category + '/' + v.img[0]
    });

    db.products.save(item);
});