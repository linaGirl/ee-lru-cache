


	var LRUCache = require( "./" );




	var cache = new LRUCache();


	cache.set( "a", 11 );
	cache.set( "b", 22 );
	cache.set( "a", 33 );

	console.log( cache.get( "a" ) );
	console.log( cache.length );