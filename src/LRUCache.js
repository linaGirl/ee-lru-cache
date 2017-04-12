{
    'use strict';

    const EventEmnitter = require('ee-event-emitter');
    const LinkedList = require('linkd');





    module.exports = class LRUCache extends EventEmnitter {




        get length() {
            return this.items.length;
        }


        get size() {
            return this.items.length;
        }






        constructor({
              size = 1000
            , maxAge = 3600
        } = {}) {
            super();

            this.maxSize = size;
            this.maxAge = maxAge;

            this.items = new LinkedList();
            this.ttl = new LinkedList();
        }






        has(key) {
            this.cleanup();
            return this.items.has(key);
        }







        get(key) {
            this.cleanup();

            if (this.items.has(key)) {
                const node = this.items.getNode(key);

                // move th enod upwards
                this.items.moveToBegin(node);

                return node.value;
            }
        }







        set(key, value) {
            this.cleanup();

            this.items.push(key, value);
            this.ttl.push(key, Date.now());


            this.emit('add', key, value);

            return this;
        }







        delete(key) {
            if (this.has(key)) {
                this.ttl.remove(key);
                return this.items.remove(key);
            }
        }







        cleanup() {
            const offsetTime = Date.now() - this.maxAge*1000;


            // clean by date
            while(true) {
                const node = this.ttl.getLastNode();

                if (node && node.value < offsetTime) {
                    this.ttl.remove(node.hash);
                    const value = this.items.remove(node.hash);

                    // tell the outside world
                    this.emit('remove', node.hash, value);
                } else break;
            }




            // clean by size
            while(this.size > this.maxSize) {
                const node = this.items.getLastNode();

                this.ttl.remove(node.hash);
                const value = this.items.remove(node.hash);

                // tell the outside world
                this.emit('remove', node.hash, value);
            }
        }
    }
}