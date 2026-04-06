const Menu = require("../schemas/menu.schema");
const ApiError = require("../utils/errors/api-error");

const MenuController = {

    findMenus: async function (filter) {
        return await Menu.find(filter);
    },

    findOne: async function (filter) {
        return await Menu.findOne(filter);
    },

    findById: async function (id) {
        let menu = await Menu.findById(id);
        if (!menu) throw ApiError.notFound("Menu không tồn tại");
        return menu;
    },

    findChildren: async function (parentId) {
        return await Menu.find({ parentId });
    },

    findMaxOrder: async function (parentId) {
        return await Menu.find({ parentId }).sort({ orderIndex: -1 }).limit(1);
    },

    create: async function (data) {
        let menu = new Menu(data);
        return await menu.save();
    },

    deleteById: async function (id) {
        let menu = await Menu.findById(id);
        if (!menu) throw ApiError.notFound("Menu không tồn tại");

        return await Menu.findByIdAndDelete(id);
    },

    findAffected: async function (parentId, deletedIndex) {
        return await Menu.find({
            parentId,
            orderIndex: { $gt: deletedIndex },
        });
    },

    save: async function (menu) {
        return await menu.save();
    }
};

module.exports = MenuController;