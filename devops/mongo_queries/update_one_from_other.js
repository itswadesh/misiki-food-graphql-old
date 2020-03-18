db.foods.find({ uid: '5cad590ba0a5d81e57c5dc74' }).forEach(
    function (elem) {
        db.foods.update(
            {
                _id: elem._id
            },
            {
                $set: {
                    uid: elem.vendor_id.valueOf()
                }
            }
        );
    }
);