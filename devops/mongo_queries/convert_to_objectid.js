db.products
  .find({ vendor: '5cb0d2d98b538f6a9bb55d05' })
  .forEach(function(elem) {
    db.products.update(
      {
        _id: elem._id
      },
      {
        $set: {
          vendor: ObjectId(elem.vendor)
        }
      }
    )
  })
