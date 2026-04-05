const Menu = require("../schemas/menu.schema");

const MenuController = {

    findMenus: async function (filter) {
        return await Menu.find(filter);
    },

    findOne: async function (filter) {
        return await Menu.findOne(filter);
    },

    findById: async function (id) {
        return await Menu.findById(id);
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