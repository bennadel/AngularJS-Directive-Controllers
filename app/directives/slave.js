(function( ng, app ) {

	"use strict";

	app.directive(
		"bnSlave",
		function() {


			// I provide a way for directives to interact using the exposed API.
			function Controller( $scope, $element, $attrs ) {

				// -- Define Controller Methods. ------------ //


				// I move the current element to the given position (delta). Notice that I 
				// update the CSS of the element directly, rather than using the slave properties.
				// This is because the moveTo() will NOT happen inside a $digest (for 
				// performance reasons). As such, the ngStyle on the element will not have any
				// effect on the position resulting from the mouse movement.
				function moveTo( deltaX, deltaY ) {

					$element.css({
						left: ( $scope.slave.x + deltaX + "px" ),
						top: ( $scope.slave.y + deltaY + "px" )
					});

				}


				// I remove the current slave from the collection.
				function remove() {

					$scope.removeSlave( $scope.slave );

				}


				// I reposition the current slave to the given position (delta). This updates
				// the slave directly, as this WILL happen inside of a $digest.
				function reposition( deltaX, deltaY ) {

					$scope.repositionSlave(
						$scope.slave,
						( $scope.slave.x + deltaX ),
						( $scope.slave.y + deltaY )
					);

				}
				

				// -- Define Controller Variables. ---------- //


				// Return public API.
				return({
					moveTo: moveTo,
					remove: remove,
					reposition: reposition
				});

			}


			// I link the $scope to the DOM element and UI events.
			function link( $scope, element, attributes, controllers ) {


				// -- Define Link Methods. ------------------ //


				// I tell the master controller that this slave controller was clicked.
				function handleMouseDown( event ) {

					$( window ).on( "mouseup.bnSlave", handleMouseUp );

					masterController.setTarget( slaveController );


				}


				// I break the link between the master controller and the slave controller.

				function handleMouseUp( event ) {

					$( window ).off( "mouseup.bnSlave" );

					masterController.setTarget( null );

				}


				// -- Define Link Variables. ---------------- //

				
				// Get the required controllers.
				var slaveController = controllers[ 0 ];
				var masterController = controllers[ 1 ];


				// Listen to position updates from the master controller.
				masterController.bind( slaveController );

				// Listen to the mouse click in order to define the current slave as the target
				// of the master.
				element.on( "mousedown.bnSlave", handleMouseDown );


				// When the scope is destroyed, make sure to unbind all event handlers to help
				// prevent a memory leak.
				$scope.$on( 
					"$destroy",
					function( event ) {

						element.off( "mousedown.bnSlave" );
						$( window ).off( "mouseup.bnSlave" );

					}
				);

			}


			// Return the directives configuration.
			return({
				controller: Controller,
				link: link,
				require: [ "bnSlave", "^bnMaster" ],
				restrict: "A"
			});


		}
	);

})( angular, demo );