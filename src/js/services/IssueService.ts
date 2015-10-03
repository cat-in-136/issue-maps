import ENDPOINT from "../Setting";

export default class IssueService {

    constructor(private $http:ng.IHttpService, private $window:ng.IWindowService) {
    }

    fetchIssues():ng.IPromise<any> {
        if (ENDPOINT.endpoint_type == "redmine")
            return this.fetchRedmineIssues();

        let url = "/assets/issues.json";
        return this.$http.get(url).then(IssueService.onResult);
    }

    isLoggedIn():boolean {
        if (ENDPOINT.endpoint_type == "redmine")
            return this.isRedmineLoggedIn();

        return true;
    }

    isRedmineLoggedIn():boolean {
        // 鍵があればログインしているということにする
        return this.getRedmineAccessKey() != null;
    }

    inputRedmineKey() {
        // ここでGUIに関わるコードは良くない
        let key = this.$window.prompt("Redmine Access Keyを入力してください");
        if (key && key.length > 0)
            this.$window.localStorage.setItem("redmine-access-key", key);
        else
            this.$window.localStorage.removeItem("redmine-access-key");
    }

    getRedmineAccessKey():string {
        return this.$window.localStorage.getItem("redmine-access-key");
    }

    fetchRedmineIssues():ng.IPromise<any> {
        if (!this.isRedmineLoggedIn()) this.inputRedmineKey();
        this.createRedmineCallback();
        let url = ENDPOINT.issues_url
            .replace(":key", this.getRedmineAccessKey());
        return this.$http.jsonp(url).then(IssueService.onResult);
    }

    createRedmineCallback() {
        // redmineがjsonpのcallback文字列からdotを消してしまう件について
        var $window:any = this.$window;
        var c:any = $window.angular.callbacks.counter.toString(36);
        $window['angularcallbacks_' + c] = (data)=> {
            $window.angular.callbacks['_' + c](data);
            delete $window['angularcallbacks_' + c];
        };
    }

    static onResult(result:any) {
        return IssueService.formatIssues(result.data.issues);
    }

    // 整形は利用するエンドポイントごとに異なるので、APIに押し込む
    static formatIssues(issues:Array<any>) {
        return issues.map(IssueService.formatIssue);
    }

    static formatIssue(issue:any):Object {
        for (var c of issue.custom_fields) {
            if (c.name == "場所")
                [issue.latitude, issue.longitude] = c.value.split(",");
        }
        return {
            id: issue.id,
            latitude: issue.latitude,
            longitude: issue.longitude,
            title: issue.subject,
            description: issue.description,
            author: issue.author.name,
            start_date: issue.start_date,
            created_on: issue.created_on,
            category: issue.category && issue.category.name
        };
    }
}