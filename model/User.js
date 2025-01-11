export default class User {
    constructor(id, name, isNonLocked, isVip, expiredVipDate, token) {
        this.id = id;
        this.name = name;
        this.isNonLocked = isNonLocked;
        this.isVip = isVip;
        this.expiredVipDate = expiredVipDate;
        this.token = token;
    }
}