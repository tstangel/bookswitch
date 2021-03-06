angular.module('bookSwitchApp').controller('BookNewController', function(
  $scope,
  $state,
  Book,
  BarcodeLookup,
  SiteData
) {
  $scope.book = new Book();
  $scope.username = SiteData.get('username');

  // load and remove previously entered ISBN. this is for the new
  // user that fills out form, registers and returns to the form
  if(SiteData.get('lastIsbnEntered')) {
    $scope.book.isbn10 = SiteData.get('lastIsbnEntered');
    SiteData.remove('lastIsbnEntered');
  }

  // save book to API
  $scope.create = function() {
    // if the user isn't logged in, save the ISBN they
    // entered for when they return after registering
    if(!$scope.username) {
      SiteData.set('lastIsbnEntered', $scope.book.isbn10);
    }

    $scope.book.$save({
      username: $scope.username,
      authentication_token: SiteData.get('authentication_token')
    }, function(response) {
      $state.go('book.show', {
        id: response.id,
        added: true
      });
    }, function(response) {
      $scope.errors = response.data.errors;
    });
  };

  // copy data from barcode scan -> api -> $scope.book
  $scope.updateFields = function(barcodeLookupResponse) {
    $scope.book = angular.merge($scope.book, barcodeLookupResponse.data.book);

    // used to autofocus price field
    if(barcodeLookupResponse.data.book)
      $scope.$broadcast('barcodeLookupSuccess');
  };

  $scope.$watch('book.isbn10', function(value) {
    BarcodeLookup.search(value).then($scope.updateFields);
  });
});
