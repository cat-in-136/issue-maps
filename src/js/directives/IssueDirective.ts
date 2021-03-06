/// <reference path="../../../typings/index.d.ts" />

import IssueService from "../services/IssueService";
export default class IssueDirective implements ng.IDirective {

    restrict:string = "E";
    scope:Object = {
        mode: "&mode",
        filteredIssues: "=filteredIssues",
        selectedIssue: "=selectedIssue",
        latlng: "=latlng"
    };
    bindToController:Boolean = true;
    controller = IssueController;
    controllerAs = "ctrl";
    templateUrl:string = "templates/_issue.html";
}

class IssueController {

    id:string;
    issue:any = null;
    isEditMode:boolean;
    mode:Function;
    loading:boolean = false;
    filteredIssues:Array<any>;
    selectedIssue:any;
    latlng: string;

    constructor(private $scope:ng.IScope, private $state:ng.ui.IStateService, private $stateParams:ng.ui.IStateParamsService, private IssueService:IssueService) {
        this.id = $stateParams["id"];
        this.fetchIssue();
        this.$scope.$watch(()=> this.latlng, ()=> this.updateLatlng());

        if ($state.includes("issues.new"))
            this.issue = {
                custom_fields: [{
                    id: 3, // マジックナンバー
                    name: "場所",
                    value: ""
                }]
            };
            this.selectedIssue = {
                id: "select",
                latitude: 35.68519569653298,
                longitude: 139.75278877116398
            };
            this.filteredIssues = [this.selectedIssue];
    }

    getPage():string {
        return "templates/issue/_" + this.mode() + ".html";
    }

    updateMode() {
        // 詳細もしくは編集の場合
        this.isEditMode = !!this.$state.includes("issues.edit");
    }

    async fetchIssue() {
        if (this.mode() == "new") return;
        //console.log("fetchIssue: "+this.selectedIssue.id);
        this.loading = true;
        let caching:boolean = !(this.$state.includes("issues.edit"));
        // XXX: tryによるエラーハンドリング
        this.issue = await this.IssueService.fetchRedmineIssue(this.$stateParams["id"], caching);
        let formattedIssue = IssueService.formatIssue(this.issue);
        this.filteredIssues = [formattedIssue];
        this.selectedIssue = formattedIssue;
        this.loading = false;
        this.$scope.$apply();
    }

    async createIssue() {
        let issue = await this.IssueService.createRedmineIssue(this.issue);
        this.$state.go("issues.show", {id: issue.id});
    }

    async updateIssue() {
        await this.IssueService.updateRedmineIssue(this.issue.id, this.issue);
        this.IssueService.clearRedmineIssueCache(this.issue.id);
        this.$state.go("issues.show", {id: this.issue.id});
    }

    private updateLatlng():void {
        if (!this.issue) return;
        this.issue.custom_fields.forEach((field:any) => {
            if (field.name != "場所") return;

            field.value = this.latlng;
        });
    }
}
