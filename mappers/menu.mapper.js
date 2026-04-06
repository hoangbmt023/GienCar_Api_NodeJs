const toMenuResponse = (menu, children = []) => ({
    id: menu._id,
    name: menu.name,
    slug: menu.slug,
    orderIndex: menu.orderIndex,
    url: menu.url,
    target: menu.target || [],
    children,
});

module.exports = { toMenuResponse };