db.categories.find({}).forEach(function (item) {
    item.children.forEach(function (c) { //iterate over array element in the current doc
        // console.log(c);
        c.megamenu = true;
    });

    db.categories.save(item);
});