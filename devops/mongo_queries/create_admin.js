use admin
db.createUser(
    {
        user: 'admin',
        pwd: 'unknown',
        roles: [{ role: 'root', db: 'admin' }]
    }
);
exit;

db.dropUser("admin", { w: "majority", wtimeout: 4000 })