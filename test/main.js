{
    'use strict';




    const assert = require('assert');
    const section = require('section-tests');
    const SpecReporter = require('section-tests').SpecReporter;
    const LRUCache = require('../');



    section.use(new SpecReporter());


    const sleep = msec => new Promise((r) => setTimeout(r, msec));



    section('LRU Cache', (section) => {
        section.test('adding items', async () => {
            const cache = new LRUCache();
            cache.set(1, 2);

            assert.equal(cache.get(1), 2, 'item not stored');
            assert.equal(cache.get(2), undefined, 'invalid data');
            assert.equal(cache.size, 1, 'invalid size');
        });


        section.test('removing items', async () => {
            const cache = new LRUCache();
            cache.set(1, 2);
            cache.delete(1);

            assert.equal(cache.get(1), undefined, 'item not removed');
            assert.equal(cache.get(2), undefined, 'invalid data');
            assert.equal(cache.size, 0, 'invalid size');
        });


        section.test('maxSize', async () => {
            const cache = new LRUCache({
                size: 2
            });

            cache.set(1, 2);
            cache.set(2, 2);
            cache.set(3, 2);
            cache.set(4, 2);
            cache.set(5, 2);

            assert.equal(cache.get(1), undefined, 'item not removed');
            assert.equal(cache.get(2), undefined, 'item not removed');
            assert.equal(cache.get(3), undefined, 'item not removed');
            assert.equal(cache.get(4), 2, 'invalid data');
            assert.equal(cache.get(5), 2, 'invalid data');
            assert.equal(cache.size, 2, 'invalid size');
        });


        section.test('maxAge', async () => {
            const cache = new LRUCache({
                maxAge: 1
            });

            cache.set(1, 2);
            cache.set(2, 2);


            assert.equal(cache.get(1), 2, 'invalid data');
            assert.equal(cache.get(2), 2, 'invalid data');

            await sleep(1200);

            assert.equal(cache.get(1), undefined, 'item not removed')
            assert.equal(cache.get(2), undefined, 'item not removed');
            assert.equal(cache.size, 0, 'invalid size');
        });


        section.test('LRU functionality', async () => {
            const cache = new LRUCache({
                size: 2
            });

            cache.set(1, 2);
            cache.set(2, 2);
            cache.get(1);
            cache.set(3, 2);
            cache.get(1);
            cache.set(4, 2);
            cache.get(1);
            cache.set(5, 2);


            assert.equal(cache.get(1), 2, 'invalid data');
            assert.equal(cache.get(2), undefined, 'item not removed');
            assert.equal(cache.get(3), undefined, 'item not removed');
            assert.equal(cache.get(4), undefined, 'item not removed');
            assert.equal(cache.get(5), 2, 'invalid data');
            assert.equal(cache.size, 2, 'invalid size');
        });
    });
}