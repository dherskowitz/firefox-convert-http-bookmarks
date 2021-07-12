const body = document.querySelector("body");
const convert_btn_top = document.querySelector("#convertBtnTop");
const convert_btn_bottom = document.querySelector("#convertBtnBottom");
const to_convert = document.querySelector("#toConvert");
const title = document.querySelector("#title");
const title_count = document.querySelector("#title__count");
const main = document.querySelector("#main");
const success = document.querySelector("#success");
const regex = new RegExp('^http:\/\/[^ "]+$');

// Conver a specific bookmark to https
function convertBookmark(id) {
    const toRemove = document.querySelector(`#${id}`).parentNode;
    toRemove.classList.add("disabled");
    setTimeout(() => {
        const bookmark = browser.bookmarks.get(id);
        bookmark.then((item) => browser.bookmarks.update(id, {url: item[0].url.replace('http', 'https')}));
        toRemove.parentNode.removeChild(toRemove); // remove item from list
        title_count.textContent = parseInt(title_count.textContent) - 1; // update count

        // hide buttons if no more links in list
        if (parseInt(title_count.textContent)  === 0) {
            convert_btn_top.classList.add("hide");
            convert_btn_bottom.classList.add("hide");
        }
    }, 200);
}

// convert all http bookmarks to https
function convertAllBookmarks(all_bookmarks) {
    const to_convert = all_bookmarks.filter(item => item.url && regex.test(item.url));
    body.classList.add("disabled");
    body.style.overflow = "hidden";
    to_convert.forEach(bookmark => {
        const bookmark_to_convert = browser.bookmarks.get(bookmark.id);
        bookmark_to_convert.then((item) => browser.bookmarks.update(bookmark.id, {url: item[0].url.replace('http', 'https')}));
    })
    main.style.display = "none";
    success.classList.remove("hide");
    body.classList.remove("disabled");
}

// create list of http bookmarks and show in popup
function findHttpBookmarks(bookmarkItems) {
    const http_bookmarks = bookmarkItems.filter(item => item.url && regex.test(item.url));

    let list = document.createElement("div"); // create list container

    // loop and create each list item
    http_bookmarks.forEach(item => {
        let list_item = document.createElement("div");
        list_item.setAttribute("class", "link");

        let item_title = document.createElement("div");
        item_title.setAttribute("class", "link__title");
        item_title.textContent = item.title;

        let item_url = document.createElement("div");
        item_url.setAttribute("class", "link__url");
        item_url.textContent = item.url;

        let item_button = document.createElement("button");
        item_button.setAttribute("class", "link__button");
        item_button.setAttribute("id", item.id);
        item_button.textContent = "Convert Link";

        list_item.appendChild(item_title);
        list_item.appendChild(item_url);
        list_item.appendChild(item_button);
        list.appendChild(list_item);
    });

    toConvert.appendChild(list) // append list to popup

    title_count.textContent = http_bookmarks.length // set count
    title.classList.add("show");

    // only show/run if any http bookmarks were found
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

// on popup open find http bookmarks and show user
browser.tabs.executeScript({file: "/assets/script.js"})
.then(searchBookmarks)
.catch(err => console.log(err));
