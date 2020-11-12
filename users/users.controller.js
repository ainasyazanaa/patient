const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./user.service');

// routes
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);
router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
		identityCard: Joi.string().required(),
		password: Joi.string().required()

        /*username: Joi.string().required(),
        password: Joi.string().required()*/
    });
    validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
	userService.authenticate(req.body)
        .then(patient => res.json(patient))
        .catch(next);
}

function registerSchema(req, res, next) {
    const schema = Joi.object({
		identityCard: Joi.string().required(),
        fullName: Joi.string().required(),
		password: Joi.string().min(6).required(),
		email: Joi.string().required(),
		phoneNumber: Joi.string().required()

    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({ message: 'Registration successful' }))
        .catch(next);
}

function getAll(req, res, next) {
    userService.getAll()
        .then(patients => res.json(patients))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.patient);
}

function getById(req, res, next) {
	userService.getById(req.params.id)
        .then(patient => res.json(patient))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
		identityCard: Joi.string().empty(''),
        fullName: Joi.string().empty(''),
		password: Joi.string().min(6).empty(''),
		email: Joi.string().empty(''),
		phoneNumber: Joi.string().empty('')
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(patient => res.json(patient))
        .catch(next);
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({ message: 'Patient deleted successfully' }))
        .catch(next);
}