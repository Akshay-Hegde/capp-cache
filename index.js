import idbAccess from "./indexedDBAccess";

(function init() {
    console.log(`Opening db`);
    idbAccess("mypage").then(db => {
        console.log(`DB Opened`);
        db.putResource("resource1", "this is a resource");
    });
})();
