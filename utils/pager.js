function paging(total, pIn, size, search = "") {
    let start = (pIn - 1) * size;
    let pages = Math.ceil(total / size);

    let show = "";
    let p = parseInt(pIn);
    show += `<span style='border:0;font-size:10px;color:#ACAFAF;'>共${total}条记录，共${pages}页 </span>`;
    show += `<a href="?search=${search}&p=1">首页</a>`;
    show += `<a href="?search=${search}&p=${p-1>=1?p-1:1}">上一页</a>`;
    show += `<span class="current">${p}</span>`;
    show += `<a href="?search=${search}&p=${p+1>pages?pages:p+1}">下一页</a>`;
    show += `<a href="?search=${search}&p=${pages}">尾页</a>`;

    return {
        start: start,
        size:parseInt(size),
        show: show
    };
}

var pager = {
    paging: paging,
}

module.exports = pager;