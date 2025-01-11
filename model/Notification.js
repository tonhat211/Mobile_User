export default class Notification{
    constructor(id, title, subContent, content, createAt, author){
        this.id = id;
        this.title = title;
        this.subContent = subContent;
        this.createAt = createAt;
        this.content = content;
        this.author = author;
    }
}