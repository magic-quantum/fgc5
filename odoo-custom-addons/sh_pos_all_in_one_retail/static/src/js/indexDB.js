odoo.define("sh_pos_all_in_one_retail.sh_pos_advance_cache.indexedDB", function (require) {
    "use strict";



    if (!window.indexedDB) {
        console.log(`Your browser doesn't support IndexedDB`);
        return;
    }

    const indexedDB = window.indexedDB

    var indexedDB_dic = {

        create_objectstore: function (objectstore) {

            const request = indexedDB.open('Softhealer_pos', 1);

            request.onerror = function (event) {
                console.error(`Database error: ${event.target.errorCode}`);
            };

            request.onupgradeneeded = function (event) {

                let db = event.target.result;

                let store = db.createObjectStore('Products',
                    { keyPath: "id" }
                );
                let store1 = db.createObjectStore('Customers',
                    { keyPath: "id" }
                );
            }
            return request
        },

        save_data: function (objectstore, data_list) {

            var self = this;

            this.create_objectstore(objectstore).onsuccess = function (ev) {

                var db = ev.target.result;

                // create a new transaction
                var txn = db.transaction(objectstore, 'readwrite');

                // get the Contacts object store
                var store = txn.objectStore(objectstore);


                _.each(data_list, function (each_data) {

                    if (objectstore === 'Products') {

                        _.each(each_data, function (value, key) {
                            if (key == 'pos') {
                                delete each_data[key];
                            }
                        });
                    }
                    var query = store.put(each_data);

                    // handle success case
                    query.onsuccess = function (event) {
                        // console.log(event);
                    };

                    // handle the error case
                    query.onerror = function (event) {
                        console.log(event.target.errorCode);
                    }

                    // close the database once the 
                    // transaction completes
                    txn.oncomplete = function () {
                        db.close();
                    };

                });



            }
        },
        get_all: function (objectstore) {

            var self = this;
            var def = new $.Deferred();

            this.create_objectstore(objectstore).onsuccess = function (ev) {

                var db = ev.target.result;

                // create a new transaction
                var txn = db.transaction(objectstore, 'readwrite');

                // get the Contacts object store
                var store = txn.objectStore(objectstore);

                store.getAll().onsuccess = function (event) {
                    let cursor = event.target.result;
                    def.resolve(cursor);
                };


            };
            return def;
        },

        get_by_id: function (objectstore, key) {

            var self = this;
            var def = new $.Deferred();

            this.create_objectstore(objectstore).onsuccess = function (ev) {

                var db = ev.target.result;

                // create a new transaction
                var txn = db.transaction(objectstore, 'readwrite');

                // get the Contacts object store
                var store = txn.objectStore(objectstore);

                store.get(key).onsuccess = function (event) {
                    let cursor = event.target.result;
                    def.resolve(cursor);
                };


            };
            return def;
        },
        delete_item: function (objectstore, key) {

            var self = this;
            var def = new $.Deferred();

            this.create_objectstore(objectstore).onsuccess = function (ev) {

                var db = ev.target.result;

                // create a new transaction
                var txn = db.transaction(objectstore, 'readwrite');

                // get the Contacts object store
                var store = txn.objectStore(objectstore);

                store.delete(key).onsuccess = function (event) {
                    let cursor = event.target.result;
                    def.resolve(cursor);
                };


            };
            return def;
        },
    }


    return indexedDB_dic;

});

odoo.define("sh_pos_all_in_one_retail.force_refresh", function (require) {
    "use strict";

    var indexedDB = require('sh_pos_advance_cache.indexedDB');
    const { PosGlobalState } = require('point_of_sale.models');
    const Registries = require('point_of_sale.Registries');
    const Chrome = require('point_of_sale.Chrome');

    const PosForceRefreshModel = (PosGlobalState) => class PosForceRefreshModel extends PosGlobalState {
        async _processData(loadedData) {
            // Force clear localStorage to ensure fresh data load
            localStorage.removeItem('Products');
            localStorage.removeItem('Customers');
            
            console.log("Forcing POS data refresh");
            
            // Continue with normal processing
            return super._processData(...arguments);
        }
    }
    
    Registries.Model.extend(PosGlobalState, PosForceRefreshModel);

    // Also add a Chrome component extension to ensure bus notifications are properly handled
    const PosForceRefreshChrome = (Chrome) => class PosForceRefreshChrome extends Chrome {
        setup() {
            super.setup();
            // Clear localStorage on load
            localStorage.removeItem('Products');
            localStorage.removeItem('Customers');
        }
    }
    
    Registries.Component.extend(Chrome, PosForceRefreshChrome);
});