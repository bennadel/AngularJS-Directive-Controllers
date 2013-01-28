(function( ng, app ) {

	"use strict";

	app.directive(
		"bnMaster",
		function() {


			// I provide a way for directives to interact using the exposed API.
			function Controller( $scope ) {


				// -- Define Controller Methods. ------------ //


				// I am utility method that applies the given method to the each item using 
				// the given arguments.
				function applyForEach( collection, methodName, methodArguments ) {

					ng.forEach(
						collection,
						function( item ) {

							item[ methodName ].apply( item, methodArguments );
						}
					);

				}


				// I add the given listern to the list of subscribers. Each listener must expose
				// two methods: moveTo( deltaX, deltaY ) and reposition( deltaX, deltaY ).
				function bind( listener ) {

					listeners.push( listener );

				}


				// I invoke the moveTo() method on each bound listener.
				function moveTo( deltaX, deltaY ) {

					applyForEach( listeners, "moveTo", [ deltaX, deltaY ] );

				}


				// I tell the target slave to remove itself from the collection.
				function remove() {

					unbind( target );

					target.remove();

				}


				// I invoke the reposition() method on each bound listener.
				function reposition( deltaX, deltaY ) {

					applyForEach( listeners, "reposition", [ deltaX, deltaY ] );

				}


				// I set the target slave.
				function setTarget( controller ) {

					target = controller;

				}


				// I unbind the given listener from the list of subscribers.
				function unbind( listener ) {

					var index = listeners.indexOf( listener );

					listeners.splice( index, 1 );

				}


				// -- Define Controller Variables. ---------- //


				// I am the collection of listeners that want to know about updated coordinates.
				var listeners = [];

				// I am the target slave - the one that was clicked to initiate movement tracking.
				var target = null;


				// Return public API.
				return({
					bind: bind,
					moveTo: moveTo,
					remove: remove,
					reposition: reposition,
					setTarget: setTarget
				});

			}


			// I link the $scope to the DOM element and UI events.
			function link( $scope, element, attributes, controller ) {


				// -- Define Link Methods. ------------------ //


				function handleMouseDown( event ) {

					var target = $( event.target );

					// Prevent default behavior to stop text selection.
					event.preventDefault();

					// The user clicked on a slave.
					if ( target.is( "li.slave" ) ) {

						// Record the initial position of the mouse so we can calculate
						// the coordinates of the reposition.
						initialPageX = event.pageX;
						initialPageY = event.pageY;

						// Bind to the movement so we can broadcast new coordinates.
						element.on( "mousemove.bnMaster", handleMouseMove );
						element.on( "mouseup.bnMaster", handleMouseUp );

					// The user clicked on the master directly.
					} else {

						$scope.$apply(
							function() {

								$scope.addSlave( event.pageX, event.pageY );
								
							}
						);

					}

				}


				function handleMouseMove( event ) {

					controller.moveTo(
						( event.pageX - initialPageX ),
						( event.pageY - initialPageY )
					);

				}


				function handleMouseUp( event ) {

					// Now that the user has finished moving the mouse, unbind the mouse events.
					element.off( "mousemove.bnMaster" );
					element.off( "mouseup.bnMaster" );

					// Check to see if the mouse has moved since its down state.
					if ( hasMoved( event.pageX, event.pageY ) ) {


						$scope.$apply(
							function() {

								controller.reposition(
									( event.pageX - initialPageX ),
									( event.pageY - initialPageY )
								);
								
							}
						);


					// The mouse has not moved since clicking - remove the target.
					} else {


						$scope.$apply(
							function() {

								controller.remove();

							}
						);
						

					}

				}


				// I determine if the given coordinates indicate that the mouse has moved.
				function hasMoved( pageX, pageY ) {

					return(
						( pageX !== initialPageX ) ||
						( pageY !== initialPageY )
					);

				}


				// -- Define Link Variables. ---------------- //


				// I hold the initial position of the mouse click.
				var initialPageX = null;
				var initialPageY = null;


				// Bind to the mouse down event so we can interact with the slaves.
				element.on( "mousedown.bnMaster", handleMouseDown );


				// When the scope is destroyed, make sure to unbind all event handlers to help
				// prevent a memory leak.
				$scope.$on( 
					"$destroy",
					function( event ) {

						element.off( "mousedown.bnMaster" );
						element.off( "mousemove.bnMaster" );
						element.off( "mouseup.bnMaster" );

					}
				);

			}


			// Return the directives configuration.
			return({
				controller: Controller,
				link: link,
				require: "bnMaster",
				restrict: "A"
			});


		}
	);

})( angular, demo );