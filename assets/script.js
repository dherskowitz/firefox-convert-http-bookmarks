const body = document.querySelector("body");
const convert_btn_top = document.querySelector("#convertBtnTop");
const convert_btn_bottom = document.querySelector("#convertBtnBottom");
const to_convert = document.querySelector("#toConvert");
const title = document.querySelector("#title");
const title_count = document.querySelector("#title__count");
const regex = new RegExp('^http:\/\/[^ "]+$');

function convertBookmark(id) {
    const toRemove = document.querySelector(`#${id}`).parentNode;
    toRemove.classList.add("disabled");
    setTimeout(() => {
        const bookmark = browser.bookmarks.get(id);
        bookmark.then((item) => browser.bookmarks.update(id, {url: item[0].url.replace('http', 'https')}));
        toRemove.parentNode.removeChild(toRemove);
        title_count.innerHTML = parseInt(title_count.textContent) - 1;
    }, 200);
}

function convertAllBookmarks(all_bookmarks) {
    const to_convert = all_bookmarks.filter(item => item.url && regex.test(item.url));
    body.classList.add("disabled");
    body.style.overflow = "hidden";
    to_convert.forEach(bookmark => {
        const bookmark_to_convert = browser.bookmarks.get(bookmark.id);
        bookmark_to_convert.then((item) => browser.bookmarks.update(bookmark.id, {url: item[0].url.replace('http', 'https')}));
    })
    body.innerHTML = "<div>All HTTP bookmarks converted sucessfully!</div>";
    body.classList.remove("disabled");
}

function findHttpBookmarks(bookmarkItems) {
    const http_bookmarks = bookmarkItems.filter(item => item.url && regex.test(item.url));

    let links = []

    http_bookmarks.forEach(item => {
        links.push(`<div class="link"><div class="link__title">${item.title}</div><div class="link__url">${item.url}</div><button id="${item.id}" class="link__button">Convert Link</button></div>`);
    });

    toConvert.innerHTML = links.join("");

    title_count.innerHTML = http_bookmarks.length
    title.classList.add("show");

    if (http_bookmarks.length > 0) {
        convert_btn_top.classList.add("show");
        convert_btn_bottom.classList.add("show");
        const convert_link_btns = document.querySelectorAll(".link__button");
        Array.from(convert_link_btns).forEach(btn => {
            btn.addEventListener("click", () => convertBookmark(btn.id));
        })
    }
}

function onRejected(error) {
    console.log(`An error: ${error}`);
}

function searchBookmarks() {
    const searching = browser.bookmarks.search({});
    searching.then(findHttpBookmarks, onRejected)
}

function searchAllBookmarks() {
    const searching = browser.bookmarks.search({});
    searching.then(convertAllBookmarks, onRejected)
}

convert_btn_top.addEventListener("click", searchAllBookmarks);
convert_btn_bottom.addEventListener("click", searchAllBookmarks);

browser.tabs.executeScript({file: "/assets/script.js"})
.then(searchBookmarks)
.catch(err => console.log(err));
