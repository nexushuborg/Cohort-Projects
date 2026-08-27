const propertyRoute = require('express').Router();
const multer = require('multer');
const path = require('path');
const {
    createProperty,
    getProperties,
    getPropertyById,
    getHostProperties,
    updatePropertyStatus,
    updateProperty,
    deleteProperty,
    uploadPropertyPhoto,
    getPropertyTypes,
    getAmenities
} = require('./properties.controller.js');
const { searchProperties } = require('../search/search.controller.js');
const { authMiddleware, rbacMiddleware } = require('../../middleware/authMiddleware.js');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

propertyRoute
    .post('/', authMiddleware, rbacMiddleware(['host', 'admin']), createProperty)
    .get('/', getProperties)
    .get('/search', searchProperties)
    .get('/types', getPropertyTypes)
    .get('/amenities', getAmenities)
    .get('/my', authMiddleware, rbacMiddleware(['host', 'admin']), getHostProperties)
    .get('/:id', getPropertyById)
    .put('/:id', authMiddleware, rbacMiddleware(['host', 'admin']), updateProperty)
    .delete('/:id', authMiddleware, rbacMiddleware(['host', 'admin']), deleteProperty)
    .put('/:id/status', authMiddleware, rbacMiddleware(['host', 'admin']), updatePropertyStatus)
    .post('/:id/photos', authMiddleware, rbacMiddleware(['host', 'admin']), upload.single('photo'), uploadPropertyPhoto);

module.exports = { propertyRoute };