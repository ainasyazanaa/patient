const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({ identityCard, password }) {
    const patient = await db.Patient.scope('withHash').findOne({ where: { identityCard } });

    if (!patient || !(await bcrypt.compare(password, patient.hash)))
        throw 'IC Number or password is incorrect';

    // authentication successful
    const token = jwt.sign({ sub: patient.id }, config.secret, { expiresIn: '7d' });
    return { ...omitHash(patient.get()), token };
}

async function getAll() {
    return await db.Patient.findAll();
}

async function getById(id) {
    return await getPatient(id);
}

async function create(params) {
    // validate
   if (await db.Patient.findOne({ where: { identityCard: params.identityCard } })) {
        throw 'Ic Number "' + params.identityCard + '" is already registered';
   }

    // hash password
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

    // save user
    await db.Patient.create(params);
}

async function update(id, params) {
    const patient = await getPatient(id);

    // validate
    const IcSame = params.identityCard && patient.identityCard !== params.identityCard;
    if (IcSame && await db.Patient.findOne({ where: { identityCard: params.identityCard } })) {
        throw 'Ic Number "' + params.identityCard + '" is already registered';
    }

    // hash password if it was entered
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

    // copy params to user and save
    Object.assign(patient, params);
    await patient.save();

    return omitHash(patient.get());
}

async function _delete(id) {
    const patient = await getPatient(id);
    await patient.destroy();
}

// helper functions

async function getPatient(id) {
    const patient = await db.Patient.findByPk(id);
    if (!patient) throw 'Patient not found';
    return patient;
}

function omitHash(patient) {
    const { hash, ...userWithoutHash } = patient;
    return userWithoutHash;
}