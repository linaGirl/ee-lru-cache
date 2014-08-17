
    var   Class     = require('ee-class')
        , Events    = require('ee-event-emitter')
        , log       = require('ee-log');





    module.exports = new Class({
        inherits: Events



        // dont cache too many items
        , _limit: 100000

        // ttl
        , _ttl: 3600000 // 1h
        , _ttilIntervalTime: 10000 // 10 sec

        // the actual items
        , _data: {}

        // first & last item
        , _first: null
        , _last: null

        // number of cached items
        , _count: 0


        , get length() {
            return this._count;
        }
        


        , init: function(options) {

            if (options && options.limit)       this._limit     = options.limit;
            if (options && options.ttl)         this._ttl       = options.ttl;
            if (options && options.forceTtl)    this._forceTtl  = options.forceTtl;

            // initialize the ttl check
            setInterval(this._ttlCheck.bind(this), this._ttilIntervalTime);
        }




        , set: function(id, data) {
            if (this._data[id]) {
                // update
                this._data[id].v = data;
                this._appendToList(this._removeFromList(id));
            }
            else {
                // create new
                this._data[id] = { id: id, p: null, n: null, v: data };
                this._appendToList(this._data[id]);
                this._count++;

                if (this._count > this._limit) {
                    this.emit('autoremove', this._first, this._data[this._first].v, this._data[this._first].t);
                    this.remove(this._first);
                }

                this.emit('add', id, data);
            }
        }



        , has: function(id) {
            return !!this._data[id];
        }


        , get: function(id) {
            if (this._data[id]) {

                // reposition item
                this._appendToList(this._removeFromList(id), this._data[id].t);

                // return
                return this._data[id].v;
            }
            return null;
        }



        , remove: function(id) {
            var item = this._removeFromList(id);
            if (item) delete this._data[id];
            this._count--;

            if (item) {
                this.emit('remove', id, item.v, item.t);
                return item.v;
            }
        }



        // add to linked list
        , _appendToList: function(item, oldTtl) {

            // set ttl flag
            item.t = (this._forceTtl && oldTtl) ? oldTtl : (Date.now() + this._ttl);

            if (this._first) {
                // there is at least on item
                this._data[this._last].n = item.id;
                item.p = this._last;
                this._last = item.id;
            }
            else {
                // this is the first item
                this._first = item.id;
                this._last = item.id;
            }
        }



        // remove from linked list
        , _removeFromList: function(id) {
            var current = this._data[id], previous, next;

            // does the item exist ?
            if (current) {
                previous    = current.p ? this._data[current.p] : null;
                next        = current.n ? this._data[current.n] : null;

                if (previous) {
                    // not the first element                    
                    if (next) {
                        // there is a next element too
                        next.p = previous.id;
                        previous.n = next.id;
                    }
                    else {
                        // last element
                        this._last = previous.id;
                        previous.n = null;
                    }
                }
                else {
                    // this was the first element
                    if (next) {
                        // there are other items
                        this._first = next.id;
                        next.p = null;
                    }
                    else {
                        // this was the only item, remove it
                        this._first = null;
                        this._last = null;                      
                    }
                }

                current.p = null;
                current.n = null;
                return current;
            }
            return null;
        }


        // removed expired items
        , _ttlCheck: function() {
            var maxItems    = 100
                , now       = Date.now()
                , item;

            while(maxItems-- && this._first && this._data[this._first].t < now) {
                item = this._data[this._first];
                this.remove(this._first);
                this.emit('autoremove', item.id, item.v, item.t);
            }
        }
    });