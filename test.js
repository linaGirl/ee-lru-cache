


	var LRUCache = require( "./" );




	var cache = new LRUCache();


	cache.set( "a", 1 );
	cache.set( "b", 2 );
	cache.set( "a", 3 );

	console.log( cache.get( "a" ) );
	console.log( cache.length );