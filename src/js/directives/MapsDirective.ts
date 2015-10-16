/// <reference path="../../../typings/tsd.d.ts" />

export default class MapsDirective implements ng.IDirective {

    restrict:string = "E";
    scope:Object = {
        issues: "=issues",
        selectedIssue: "=selectedIssue"
    };
    bindToController:Boolean = true;
    controller = MapsController;
    controllerAs = "ctrl";
    templateUrl:string = "templates/_maps.html";
}

class MapsController {

    map:any = {
        center: {
            latitude: 35.68519569653298,
            longitude: 139.75278877116398
        },
        zoom: 12
    };

    issues:Array<any> = [];
    selectedIssue:any = null;
    clickedMarker:any = {
        id: "clickedMaker",
        coords: null
    };

    markersEvents = {
        click: (marker, eventName, model, args)=> {
            this.issues.forEach((issue:any)=> {
                issue.show = false;
            });
            model.show = true;
            this.selectedIssue = model;
        }
    };

    searchEvents = {
        places_changed: (searchBox:any)=> {
            console.log(searchBox.getPlaces());
            var location:any = searchBox.getPlaces()[0].geometry.location;
            this.map.center.latitude =  location.J;
            this.map.center.longitude =  location.M;
            this.map.zoom = 15;
        }
    };

    mapEvents = {
        click: (e:any, e2:any, e3:any)=> {
            console.log(e3);
            this.clickedMarker.coords = {
                latitude: e3[0].latLng.J,
                longitude: e3[0].latLng.M
            };
            console.log(this.clickedMarker.coords);
            this.$scope.$apply();
        }
    };

    constructor(private $scope:ng.IScope) {
        $scope.$watch(() => this.selectedIssue, (issue)=> this.gotoIssue(issue));
    }

    gotoIssue(issue) {
        if (!issue) return;
        this.map.center.latitude = issue.latitude;
        this.map.center.longitude = issue.longitude;
    }
}
